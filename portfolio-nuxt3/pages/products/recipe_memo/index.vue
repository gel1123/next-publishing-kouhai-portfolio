<script setup lang="ts">
/**
 * レシピ一覧リンク。初期値は空の配列だが、
 * mountedでIndexedDBから全てのレシピの名前とIDを操作して、
 * このリンク一覧にpushする。
 */
const links = ref<
  {
    url: string;
    text: string;
  }[]
>([]);

// IndexedDBのDB名とテーブル名
const dbName = "recipe-memo";
const tableName = "recipe";

onMounted(() => {
  const openRequest = indexedDB.open(dbName);
  openRequest.onsuccess = (event) => {
    const db = (event.target as IDBRequest).result;

    // 閲覧のみなので、readonlyでトランザクションを開始する。
    // なおレシピを書くページでは、
    // 読み書き双方行うので第二引数がreadwriteだった。
    const transaction = db.transaction(tableName, "readonly");

    const table = transaction.objectStore(tableName) as IDBObjectStore;

    // DB内のレコードを１件ずつ巡回するためのカーソルをリクエストする
    const cursorRequest = table.openCursor();

    // カーソルの取得成功ごとに発火するイベント
    // カーソルをcontinue()で前進させた場合にも発火する
    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor) return;

      // 現在のカーソル位置のレコードを取得して、
      // レシピのリンク一覧に追加する
      const record = cursor.value;
      links.value.push({
        /**
         * idからレシピ詳細ページのURLを生成する。
         * なおレシピ詳細ページは、
         * pages/products/recipe_memo/[id]/index.vue
         * として実装された動的ルートである。
         */
        url: `/products/recipe_memo/${record.id}`,
        /** リンク名でありレシピ名でもある */
        text: record.name,
      });

      // 次のカーソルに移動する
      //（cursorRequest.onsuccessが再度呼ばれる）
      cursor.continue();
    };
  };

  // IndexedDB初回オープン時のオブジェクトストア作成処理。
  // レシピを各ページと同様。
  openRequest.onupgradeneeded = (event) => {
    const db = (event.target as IDBRequest).result;
    db.createObjectStore(tableName, { keyPath: "id" });
  };
});

// アプリのトップに戻る関数
const goWrite = () => {
  navigateTo("/products/recipe_memo/write");
};
</script>
<template>
  <TheContainer>
    <AppH1>レシピをメモできるアプリ</AppH1>
    <AppH2>レシピ一覧</AppH2>
    <AppUl>
      <!-- link.urlには一意なidが含まれており、keyとして使える -->
      <li v-for="link in links" :key="link.url">
        <AppLink :href="link.url">{{ link.text }}</AppLink>
      </li>
    </AppUl>
    <div class="p-4 text-right">
      <ButtonCircularPlus :onClick="goWrite" />
    </div>
  </TheContainer>
</template>
