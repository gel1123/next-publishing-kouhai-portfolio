<script setup lang="ts">
const newPost = ref("");
const config = useRuntimeConfig();
const { data, pending, error, refresh } = useFetch("/api/listPosts", {
  headers: {
    // SSR時にLambda Function URLsからserver/apiへクエリを発行するので、
    // CloudFront経由時と同様のrefererを自前でセットしてやる
    //
    // なおフロントエンドからのコール時には不要であり、
    // 下記のconfigはprivateなので意図した通りに動く。
    referer: config.referer ?? "",
  },
});
const doesShowModal = ref(false);
const showModal = () => {
  doesShowModal.value = true;
};
const write = async () => {
  if (!newPost.value) {
    return;
  }
  await $fetch("/api/writePost", {
    method: "POST",
    body: JSON.stringify({ newPost: newPost.value }),
  });
  newPost.value = "";
  refresh();
  doesShowModal.value = false;
};
</script>
<template>
  <TheContainer>
    <AppH1>投稿が数日で消える掲示板</AppH1>
    <div
      class="my-8 mx-2 grid border-separate grid-cols-1 gap-4 divide-y border-2"
    >
      <div v-if="pending">読み込み中...</div>
      <div v-else-if="error">
        エラーが発生しました。時間を置いて再度お試しください。
      </div>
      <div v-else-if="!data?.posts || !data.posts.length" class="h-80">
        投稿がありません。
      </div>
      <div
        v-else
        v-for="{ post, createdAt } in data?.posts"
        class="whitespace-pre-wrap break-words p-2"
      >
        <div class="text-right text-sm">
          {{
            // ここでcreatedAtを日本時間に変換している。
            // ロケール指定なしでも良いが、その場合、サーバとフロントでレンダリング結果が異なり
            // エラー『Hydration completed but contains mismatches.』
            // が発生する可能性がある。
            new Date(createdAt).toLocaleString("ja-JP", {
              timeZone: "Asia/Tokyo",
            })
          }}
        </div>
        <div>{{ post }}</div>
      </div>
    </div>
    <div class="fixed bottom-8">
      <ButtonCircularPlus :onClick="showModal" />
    </div>
    <teleport v-if="doesShowModal" to="#the_container">
      <!-- 注意：v-ifなしだとサーバでのレンダリング時にTheContainerコンポーネントの準備が出来ておらずエラーになる -->
      <div
        v-if="doesShowModal"
        @click="
          (event) => {
            // 子要素以外の場所をクリックしたらモーダルを閉じる
            if (event.target === event.currentTarget) {
              doesShowModal = false;
            }
          }
        "
        class="fixed inset-0 flex h-screen w-screen items-center justify-center bg-coffee bg-opacity-50 px-2 dark:bg-cream dark:bg-opacity-30"
      >
        <!-- 閉じるボタンをバツで表現する -->
        <button
          class="absolute top-0 right-0 m-6 text-5xl font-bold text-cream hover:opacity-70 dark:text-coffee"
          @click="doesShowModal = false"
        >
          ×
        </button>
        <div
          class="container mx-auto w-full overflow-auto rounded-md bg-cream p-4 text-coffee dark:bg-coffee dark:text-cream"
        >
          <AppH2>投稿する</AppH2>
          <p class="my-2">下記から投稿してください。</p>
          <InputTextarea v-model="newPost" />
          <ButtonPrimary :onClick="write">投稿する</ButtonPrimary>
        </div>
      </div>
    </teleport>
  </TheContainer>
</template>
