<template>
  <TheContainer>
    <AppH1>プロフィール</AppH1>
    <div class="sm:flex">
      <!-- /img ではなく img から始めると npm run generate などでエラーになるので注意 -->
      <!-- また、publicディレクトリを新しく作成した直後なら、一度開発サーバーを起動し直すことを推奨（404になる場合がある） -->
      <AppIcon src="/img/my-icon.png" />
      <!-- sm以上でflexになるから、アイコンと隣り合わせになる -->
      <div class="grid gap-y-4 sm:ml-4">
        <div>
          <AppH2>名前</AppH2>
          <div>わたし（後輩）</div>
        </div>
        <div>
          <AppH2>経歴</AppH2>
          <div>
            <p>23年3月XX大学卒業見込み。</p>
            <p>XX学部XX学科に所属しており、現在卒論研究中。</p>
            <p>
              専攻は情報通信業と直接関連していないが、
              所属サークルのホームページを作る中でプログラミングに興味を持った。
            </p>
          </div>
        </div>
        <div>
          <AppH2>趣味</AppH2>
          <div>お菓子作りと読書</div>
        </div>
      </div>
    </div>
  </TheContainer>
</template>
