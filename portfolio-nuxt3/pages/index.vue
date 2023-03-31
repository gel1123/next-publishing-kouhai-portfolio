<template>
  <TheContainer>
    <AppJumbotron>kouhai-portfolio</AppJumbotron>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <AppH2>このサイトについて</AppH2>
        <div>
          <p>このサイトは、わたし（後輩）のポートフォリオサイトです。</p>
          <p>Nuxt3とTailwind CSSで作りました。</p>
        </div>
      </div>
      <div>
        <AppH2>メニュー</AppH2>
        <div>
          <p>好きなメニューを選んでください。</p>
        </div>
        <AppUl>
          <li>
            <AppLink href="/profile">プロフィール</AppLink>
          </li>
          <li>
            <AppLink href="/products">作品を見る</AppLink>
          </li>
        </AppUl>
      </div>
    </div>
  </TheContainer>
</template>
