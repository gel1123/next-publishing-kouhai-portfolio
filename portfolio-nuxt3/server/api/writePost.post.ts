import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ newPost?: string }>(event);

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  await client.send(
    new PutCommand({
      TableName: "portfolioTable",
      Item: {
        // Partition key
        id: "bbs",
        // Sort key
        createdAt: Date.now(),
        post: body.newPost,
        // 有効期限を秒単位のUnixタイム（整数）で2日後に指定する。
        ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
      },
    })
  );
  return { result: "success" };
});
