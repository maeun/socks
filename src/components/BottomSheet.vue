<template>
    <div class="custom-bottom-sheet" :style="{ height: `${sheetHeight}px` }">
      <div
        class="drag-handle"
        @mousedown="startDrag"
        @touchstart="startDrag"
      ></div>
      <div v-if="sheetHeight > minHeight" class="sheet-content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "BottomSheet",
    props: {
      sheetHeight: {
        type: Number,
        required: true
      },
      minHeight: {
        type: Number,
        required: true
      },
      maxHeight: {
        type: Number,
        required: true
      }
    },
    emits: ['update:sheet-height'],
    data() {
      return {
        startY: 0,
        startHeight: 0
      };
    },
    methods: {
      startDrag(event) {
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        this.startY = clientY;
        this.startHeight = this.sheetHeight;
        document.addEventListener("mousemove", this.onDrag);
        document.addEventListener("touchmove", this.onDrag);
        document.addEventListener("mouseup", this.stopDrag);
        document.addEventListener("touchend", this.stopDrag);
      },
  
      onDrag(event) {
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        const delta = this.startY - clientY;
        const newHeight = Math.max(
          this.minHeight,
          Math.min(this.maxHeight, this.startHeight + delta)
        );
        this.$emit('update:sheet-height', newHeight);
      },
  
      stopDrag() {
        document.removeEventListener("mousemove", this.onDrag);
        document.removeEventListener("touchmove", this.onDrag);
        document.removeEventListener("mouseup", this.stopDrag);
        document.removeEventListener("touchend", this.stopDrag);
        
        const newHeight = this.sheetHeight < this.maxHeight / 2 
          ? this.minHeight 
          : this.maxHeight;
        this.$emit('update:sheet-height', newHeight);
      }
    }
  };
  </script>
  
  <style scoped>
  .custom-bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 999;
    transition: height 0.2s ease;
  }
  
  .drag-handle {
    width: 40px;
    height: 5px;
    border-radius: 999px;
    background-color: #e0e0e0;
    margin: 10px auto;
    cursor: grab;
  }
  
  .drag-handle:active {
    cursor: grabbing;
  }
  
  .sheet-content {
    padding: 0 16px 16px 16px;
    height: calc(100% - 25px);
    overflow-y: auto;
  }
  </style>