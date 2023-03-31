export type RecipeEntity = {
  name: string;
  items: {
    name: string;
    amount: "" | number;
    unit: string;
  }[];
  howToCook: string;
};

export type BbsEntity = {
  id: "bbs";
  createdAt: number;
  post: string;
  ttl: number;
};
