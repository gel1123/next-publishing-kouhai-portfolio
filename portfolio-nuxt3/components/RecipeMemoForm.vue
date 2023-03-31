<script setup lang="ts">
/**
 * 親からv-modelで渡され、プロパティごとに
 * 子のv-modelに連携するレシピ入力UI全体の入力情報
 */
type RecipeModel = {
  /** レシピの名前フォーム */
  name: string;
  /** 材料グループ */
  items: {
    /** 材料の名前フォーム */
    name: string;
    /** 材料の個数フォーム */
    amount: "" | number;
    /** 材料の単位フォーム */
    unit: string;
  }[];
  /** 作り方フォーム */
  howToCook: string;
};

// 親-自身-子の間でv-model経由の入力値連携を行う
const props = defineProps<{
  /** レシピ入力UI全体の入力情報 */
  modelValue: RecipeModel;
  /** レシピごとに割り振られる一意なID */
  id: string;
  /** レシピの書き込み時にリダイレクトする関数 */
  redirectOnSuccess: string;
}>();
const emits = defineEmits<{
  (e: "update:modelValue", value: RecipeModel): void;
}>();
const form = computed({
  get: () => props.modelValue,
  set: (value) => emits("update:modelValue", value),
});

/** 材料を削除する処理 */
const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
};

/** 材料を追加する処理 */
const addItem = () => {
  form.value.items.push({
    name: "",
    amount: "",
    unit: "",
  });
};

// IndexedDBのDB名とテーブル名
const dbName = "recipe-memo";
const tableName = "recipe";

/** レシピを保存する処理 */
const submit = () => {
  // form.valueの中身を分割代入でバラす
  const { name, items, howToCook } = form.value;

  // いずれかのフォームが空白ならエラー
  if (
    !name ||
    !howToCook ||
    items.some(
      (item) => !item.name || !Number.isFinite(item.amount) || !item.unit
    )
  ) {
    alert("いずれかのフォームが空白です");
    return;
  }

  // IndexedDBを使うには、まずはIndexedDB自体を開く必要がある。
  // なので最初に、そのためのリクエストをopen関数で実行する。
  // その際、引数には使いたい任意のDB名を渡す。
  const openRequest = indexedDB.open(dbName);

  // IndexedDBの起動に成功したら、次のコールバック関数を実行する
  openRequest.onsuccess = (event) => {
    // 起動しただけではレシピの保存をできない。
    // まずコールバック関数の引数からIndexedDBのインスタンスを取得する。
    // なお型推論が弱いので、より厳密な型を明示している
    const db = (event.target as IDBRequest).result;

    // トランザクション（DBとやりとりする一連の処理）を開始する
    const transaction = db.transaction(tableName, "readwrite");

    // テーブル名を指定して、IndexedDBからテーブルを取得する
    //（厳密にはテーブルではなくオブジェクトストア）
    // なおこのテーブルは親が事前に作成しておく前提
    const table = transaction.objectStore(tableName) as IDBObjectStore; // 型推論が弱いのでここでも型を明示

    // ---- ここまででようやくIndexedDBへの操作が可能になった！ ----

    /** 親から渡されたレシピID */
    const id = props.id;

    // テーブルへのレシピ保存を試行する
    const putRequest = table.put({
      // 親がidをIndexedDBのキーとして使えるよう準備してある前提
      id,
      name,
      items: items.map((i) => ({
        // 仕様上、シリアライズ可能な値にすべきなのでmapする
        // mapしないと下記のエラーが出る。
        // Uncaught DOMException: Failed to execute 'put' on 'IDBObjectStore': [object Array] could not be cloned.
        // 参考：https://github.com/localForage/localForage/issues/610
        name: i.name,
        amount: i.amount,
        unit: i.unit,
      })),
      howToCook,
    });
    // レシピ保存に成功したら、親から渡されたリダイレクト関数を実行
    putRequest.onsuccess = () => {
      alert("保存に成功しました");
      navigateTo(props.redirectOnSuccess);
    };
    // レシピ保存に失敗したら、アラートを出す
    putRequest.onerror = () => {
      alert("保存に失敗しました");
    };
  };
};
</script>
<template>
  <div class="grid gap-8">
    <label>
      レシピの名前
      <InputText v-model="form.name" />
    </label>
    <div
      v-for="(item, index) in form.items"
      class="bg-cyan-100 rounded-md p-4 shadow-md"
    >
      <div class="w-full text-right">
        <ButtonSecondary :onClick="() => removeItem(index)"
          >材料 {{ index + 1 }} を削除する</ButtonSecondary
        >
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <label>
          材料 {{ index + 1 }} の名前
          <InputText v-model="item.name" />
        </label>
        <label>
          材料 {{ index + 1 }} の個数
          <InputNum v-model="item.amount" />
        </label>
        <label>
          材料 {{ index + 1 }} の単位
          <InputText v-model="item.unit" />
        </label>
      </div>
    </div>
    <div>
      <ButtonPrimary :onClick="addItem"> 材料を追加する </ButtonPrimary>
    </div>
    <label>
      作り方
      <InputTextarea v-model="form.howToCook"></InputTextarea>
    </label>
    <div class="w-full text-right">
      <ButtonPrimary :onClick="submit"> レシピを保存する </ButtonPrimary>
    </div>
  </div>
</template>
