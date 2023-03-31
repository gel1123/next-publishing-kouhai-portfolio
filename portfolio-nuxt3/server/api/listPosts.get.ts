import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { BbsEntity } from "~~/types/entities";

export default defineEventHandler(async (event) => {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const result = await client.send(
    new QueryCommand({
      TableName: "portfolioTable",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": "bbs",
      },
      Limit: 100,
      // ソートキーの降順で取得する
      ScanIndexForward: false,
    })
  );
  const posts = (result.Items as BbsEntity[]).map((item) => {
    return {
      post: item.post,
      createdAt: item.createdAt,
    };
  });
  return { posts };
});
