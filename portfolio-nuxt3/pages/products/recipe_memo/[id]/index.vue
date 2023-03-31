<script setup lang="ts">
import { RecipeEntity } from "~~/types/entities";

// 動的ルートからレシピのidを取得する
const route = useRoute();
const id = route.params.id;

/**
 * レシピの実体であり、mountedでIndexedDBから
 * レシピを取得できたら、このrefにセットする。
 * それまでは未取得なのでnullとする。
 */
const record = ref<RecipeEntity | null>(null);

// IndexedDBのDB名とテーブル名
const dbName = "recipe-memo";
const tableName = "recipe";

onMounted(() => {
  const openRequest = indexedDB.open(dbName);
  openRequest.onsuccess = (event) => {
    const db = (event.target as IDBRequest).result;

    // 閲覧のみなので、readonlyでトランザクションを開始する
    const transaction = db.transaction(tableName, "readonly");

    const table = transaction.objectStore(tableName) as IDBObjectStore;

    // キーを指定してレシピの取得リクエストを発行する。
    // なおキーとは、オブジェクトストア作成時に識別子として指定した
    // プロパティのことであり、
    // レシピメモアプリ上では、レコードのidプロパティを示している。
    const getRequest = table.get(id);

    // レシピ取得に成功したら実行される
    getRequest.onsuccess = (event) => {
      // 事前にrefで定義して初期値nullとした変数recordを、
      // DBから取得したレシピのレコードで更新する。
      record.value = (event.target as IDBRequest).result;

      // なんらかの理由でレシピの存在しないはずのidでアクセスした場合、
      // エラーとみなしてアプリのトップページにリダイレクトさせる。
      if (!record.value) {
        alert("レシピが見つかりません。アプリのトップページに戻ります");
        navigateTo("/products/recipe_memo");
      }
    };
  };
});

/** レシピを削除する機能 */
const deleteItem = () => {
  // 確認ダイアログで「キャンセル」を選んだら、
  // 削除処理を行わずに、この処理を終える。
  if (
    !confirm(`${record.value?.name}のレシピを本当に削除してもよろしいですか？`)
  )
    return;

  // 確認ダイアログで「OK」を選んだなら、以下で
  // IndexedDBから、このレシピを削除する。
  const openRequest = indexedDB.open(dbName);
  openRequest.onsuccess = (event) => {
    const db = (event.target as IDBRequest).result;
    const transaction = db.transaction(tableName, "readwrite");
    const table = transaction.objectStore(tableName) as IDBObjectStore;
    const deleteRequest = table.delete(id);

    deleteRequest.onsuccess = () => {
      // 削除処理に成功したら、アプリのトップに戻る
      alert("削除が完了しました");
      navigateTo("/products/recipe_memo");
    };
  };
};

/** レシピの更新画面へ遷移する関 */
const goWrite = () => {
  navigateTo(`/products/recipe_memo/${id}/write`);
};

/** アプリのトップに戻る関数 */
const goBack = () => {
  navigateTo("/products/recipe_memo");
};
</script>
<template>
  <TheContainer>
    <AppH1>{{ record ? `${record.name}のレシピ` : "読み込み中..." }}</AppH1>
    <div class="text-right">
      <ButtonSecondary :onClick="goBack">アプリTOPに戻る</ButtonSecondary>
    </div>
    <AppH2>材料</AppH2>
    <div>
      <div v-for="(item, index) in record?.items">
        {{ item.name }} {{ item.amount }} {{ item.unit }}
      </div>
    </div>
    <AppH2>作り方</AppH2>
    <div class="whitespace-pre-wrap">
      {{ record?.howToCook }}
    </div>
    <!-- スマホ幅より広いなら２列で描画する -->
    <div v-if="record" class="mt-4 grid gap-3 sm:grid-cols-2">
      <ButtonPrimary :onClick="goWrite"> このレシピを編集する </ButtonPrimary>
      <ButtonDanger :onClick="deleteItem">このレシピを削除する</ButtonDanger>
    </div>
  </TheContainer>
</template>
