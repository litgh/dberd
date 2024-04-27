<template>
  <div class="relative">
    <slot></slot>
    <div
      :data-position="position"
      class="hidden group-hover:block px-2 py-1 rounded-md absolute z-[999] tooltip text-nowrap text-xs bg-black text-white"
    >
      <div class="arrow"></div>
      {{ content }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  position: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
});
</script>

<style scoped>
.tooltip[data-position^=top] {
  margin-bottom: 10px;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip[data-position^=left] {
  margin-right: 10px;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
}

.tooltip[data-position^=right] {
  margin-left: 10px;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
}

.tooltip[data-position^=bottom] {
  margin-top: 10px;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip .arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.tooltip[data-position^=top] .arrow {
  bottom: -5px;
  left: 50%;
  margin-left: -5px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #000;
}

.tooltip[data-position^=left] .arrow {
  top: 50%;
  right: -5px;
  margin-top: -5px;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 5px solid #000;
}

.tooltip[data-position^=right] .arrow {
  top: 50%;
  left: -5px;
  margin-top: -5px;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid #000;
}

.tooltip[data-position^=bottom] .arrow {
  top: -5px;
  left: 50%;
  margin-left: -5px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #000;
}
</style>
