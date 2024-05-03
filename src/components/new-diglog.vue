<script setup lang="ts"></script>
<template>
  <div class="dialog-body">
    <div class="title">新的聊天</div>
    <div class="bottom">
      <span class="dialog-count"> 0条对话 </span>
      <span class="time"> 2024/3/15 11:14:37 </span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.dialog-body {
  box-sizing: border-box;
  height: 65px;
  background-color: white;
  border: 2px solid rgb(28, 147, 171);
  border-radius: 8px;
  padding: 8px 15px;
  margin: 4px 0px;
  .title {
    margin-bottom: 5px;
    color: black;
    font-weight: bold;
  }
  .bottom {
    font-size: small;
    color: rgb(176, 174, 184);
    display: flex;
    justify-content: space-between;
  }
}
</style>
