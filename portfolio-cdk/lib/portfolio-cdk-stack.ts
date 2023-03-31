import {
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginAccessIdentity,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  PriceClass,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import {
  Code,
  Function,
  FunctionUrlAuthType,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

// dotenvパッケージで.envから環境変数をロードするのに必要であり、
// importしないとロードできないので忘れないよう注意。
// ※なおNuxt3は最初から.envをサポートしているのでこういったimportなしで使える。
import "dotenv/config";

export class PortfolioCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ---- 環境変数 ----
    const referer = process.env.REFERER ?? "";

    // ---- S3 ----
    const nuxt3Bucket = new Bucket(this, "nuxt3Bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const nuxt3Oai = new OriginAccessIdentity(this, "nuxt3Oai");
    const nuxt3BucketOrigin = new S3Origin(nuxt3Bucket, {
      originAccessIdentity: nuxt3Oai,
    });

    // ---- Lambda ----
    const lambda = new Function(this, "nitro", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("../portfolio-nuxt3/.output/server"),
      handler: "index.handler",
      timeout: Duration.seconds(5),
      memorySize: 2048,
      logRetention: RetentionDays.ONE_MONTH,
      // 下記はセットして意味がない（Nitroがビルド時に環境変数を解決するので）
      // environment: {
      //   REFERER_VALUE: referer,
      // },
    });
    const functionUrl = lambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });
    // https://github.com/aws/aws-cdk/issues/20254
    const lambdaOrigin = new HttpOrigin(
      Fn.select(2, Fn.split("/", functionUrl.url)),
      {
        // CloudFrontからLambda関数URLsへ渡すカスタムヘッダー。
        // 下記Refererを用いてCloudFront以外からのアクセスを制限する。
        customHeaders: { referer },
      }
    );

    // ---- DynamoDB ----
    const portfolioTable = new Table(this, "portfolioTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: AttributeType.NUMBER,
      },
      tableName: "portfolioTable",
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
      // 有効期限の指定に用いるカラム名
      timeToLiveAttribute: "ttl",
    });
    portfolioTable.grantReadWriteData(lambda);

    // ---- CloudFront ----
    const distribution = new Distribution(this, "cdn", {
      priceClass: PriceClass.PRICE_CLASS_200,
      defaultBehavior: {
        origin: lambdaOrigin,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        originRequestPolicy: new OriginRequestPolicy(
          this,
          "lambdaOriginRequestPolicy",
          {
            /**
             * HOSTヘッダは、Lambdaの仕様上設定するとエラーになるので、
             * OriginRequestHeaderBehavior.all() にはすべきでない。
             *
             * refererはLambda関数URLsのアクセス経路判定に用いるので許可する。
             *
             * ...と思ったが、これはオリジンで設定されるヘッダーであり、
             * ここでUserAgentとの連携に用いるものではないのでやっぱりnoneに戻す
             *
             * 参考
             * - https://webcache.googleusercontent.com/search?q=cache:IPDnHfm6ItMJ:https://dev.classmethod.jp/articles/integrate-aws-lambda-with-cloudfront/&cd=3&hl=ja&ct=clnk&gl=jp
             */
            headerBehavior: OriginRequestHeaderBehavior.none(),
            cookieBehavior: OriginRequestCookieBehavior.all(),
            queryStringBehavior: OriginRequestQueryStringBehavior.all(),
          }
        ),
        cachePolicy: new CachePolicy(this, "lambdaCachePolicy", {
          // もしキャッシュありかつCookieで挙動を変えたいなら
          // cookieBehaviorを設定すべきだが、
          // キャッシュ無効なら逆にcookieBehaviorを設定するとエラーになる
          minTtl: Duration.seconds(0),
          defaultTtl: Duration.seconds(0),
          maxTtl: Duration.seconds(0),
        }),
      },
      additionalBehaviors: {
        "/*.*": {
          origin: nuxt3BucketOrigin,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
          originRequestPolicy: new OriginRequestPolicy(
            this,
            "nuxt3OriginRequestPolicy",
            {
              headerBehavior: OriginRequestHeaderBehavior.none(),
              cookieBehavior: OriginRequestCookieBehavior.none(),
              queryStringBehavior: OriginRequestQueryStringBehavior.none(),
            }
          ),
          cachePolicy: new CachePolicy(this, "nuxt3CachePolicy", {
            cookieBehavior: OriginRequestCookieBehavior.none(),
            minTtl: Duration.hours(1),
            defaultTtl: Duration.hours(2),
            maxTtl: Duration.hours(3),
          }),
        },
      },
    });

    // ---- S3 Deployment ----
    new BucketDeployment(this, "nuxt3BucketDeployment", {
      sources: [Source.asset("../portfolio-nuxt3/.output/public")],
      destinationBucket: nuxt3Bucket,
      logRetention: RetentionDays.ONE_MONTH,
      // デプロイ後のCDNキャッシュ削除
      distribution,
    });

    // ---- Output ----
    new CfnOutput(this, "FUNCTION", {
      value: functionUrl.url,
    });
    new CfnOutput(this, "CDN", {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
