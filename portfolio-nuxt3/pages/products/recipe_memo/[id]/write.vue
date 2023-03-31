<script setup lang="ts">
import { RecipeEntity } from "~~/types/entities";

// 動的ルートからレシピのIDを取得
const route = useRoute();
const id = route.params.id as string;

// IndexedDBのDB名とテーブル名
const dbName = "recipe-memo";
const tableName = "recipe";

/**
 * レシピの実体であり、入力UIにv-modelで渡すフォームでもある。
 * この時点では初期値は空文字列だが、mountedでIndexedDB
 * から得られた既存レシピのデータで上書きされる。
 */
const form = reactive<RecipeEntity>({
  name: "",
  items: [
    {
      name: "",
      amount: "",
      unit: "",
    },
  ],
  howToCook: "",
});

// mounted時にやることは、レシピの詳細ページと同じ。
// 動的ルートのidでレシピを取得して、formにセットする。
onMounted(() => {
  const openRequest = indexedDB.open(dbName);
  openRequest.onsuccess = (event) => {
    const db = (event.target as IDBRequest).result;
    const transaction = db.transaction(tableName, "readonly");
    const table = transaction.objectStore(tableName) as IDBObjectStore;
    const getRequest = table.get(id);
    getRequest.onsuccess = (event) => {
      const r = (event.target as IDBRequest).result;
      form.name = r.name;
      form.items = r.items;
      form.howToCook = r.howToCook;
    };
  };
});

/** このレシピの詳細ページに戻る */
const goBack = () => {
  navigateTo(`/products/recipe_memo/${id}`);
};
</script>
<template>
  <TheContainer>
    <AppH1>{{
      form && form.name ? `${form.name}のレシピを編集する` : "レシピを編集する"
    }}</AppH1>
    <div class="text-right">
      <ButtonSecondary :onClick="goBack">編集をやめる</ButtonSecondary>
    </div>

    <!--
      既存レシピのデータが入ったformさえ渡せば、
      あとは新規レシピ保存でも使ったレシピ入力UIが、
      以降の書き込み処理まで正しく動かしてくれる。

      なおidとして渡す値は、新規登録時とは異なり、
      動的ルートのURLパラメータから得られたidを渡す。
      そうすることで、RecipeMemoFormコンポーネントが
      レシピを新規登録ではなく、既存レコードに上書き
      する形で保存できる。
    -->
    <RecipeMemoForm
      :id="id"
      :redirectOnSuccess="`/products/recipe_memo/${id}`"
      v-model="form"
    ></RecipeMemoForm>
  </TheContainer>
</template>
