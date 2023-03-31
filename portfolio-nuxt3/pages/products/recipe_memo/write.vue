<script setup lang="ts">
import { v4 } from "uuid";
import { RecipeEntity } from "~~/types/entities";

// IndexedDBのDB名とテーブル名
const dbName = "recipe-memo";
const tableName = "recipe";

// IndexedDBはブラウザの機能なのでmounted時に初期化させる
onMounted(() => {
  const openRequest = indexedDB.open(dbName);

  // IndexedDBの初回オープンでは、onupgradeneededイベントが発火する。
  // このイベントの中なら、オブジェクトストアを作成したり、
  // DBの構造を変更することができる。
  openRequest.onupgradeneeded = (event) => {
    // IndexedDBのインスタンス
    const db = (event.target as IDBRequest).result;

    // テーブル名とレコードの識別子となるキーの名前を指定して、
    // 新たにテーブル（正確にはオブジェクトストア）を作成する。
    db.createObjectStore(tableName, { keyPath: "id" });
  };
});

/**
 * レシピの実体であり、入力UIにv-modelで渡すフォームでもある。
 * 新規登録なので、全て初期値は空文字列にしている。
 */
const form = reactive<RecipeEntity>({
  // レシピの名前
  name: "",
  // 材料グループ（初期状態は材料グループ１件。UIから任意に増減可）
  items: [
    {
      // 材料の名前
      name: "",
      // 材料の個数
      amount: "",
      // 材料の単位
      unit: "",
    },
  ],
  // 作り方
  howToCook: "",
});

/**
 * アプリのトップに戻る関数
 * （ポートフォリオサイトのトップではなく）
 */
const goBack = () => {
  navigateTo("/products/recipe_memo");
};
</script>
<template>
  <TheContainer>
    <AppH1>レシピをメモできるアプリ</AppH1>
    <div class="text-right">
      <ButtonSecondary :onClick="goBack">アプリTOPに戻る</ButtonSecondary>
    </div>
    <AppH2>レシピを書く</AppH2>
    <!-- 新規レシピなのでidはその都度ランダムに生成 -->
    <RecipeMemoForm
      :id="v4()"
      redirectOnSuccess="/products/recipe_memo"
      v-model="form"
    ></RecipeMemoForm>
  </TheContainer>
</template>
