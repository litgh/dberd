<template>
  <div class="w-full h-full flex flex-col">
    <div
      class="flex w-full justify-between items-center py-2 md:px-4 px-2 border-b shadow-md"
    >
      <div class="flex items-center text-md">
        <div
          class="font-bold bg-gradient-to-r from-slate-700 from-10% via-slate-500 to-slate-700 inline-block text-transparent bg-clip-text"
        >
          Database E/R Design Tool
        </div>
        <div class="ml-4 font-bold flex space-x-4">
          <div>Features</div>
        </div>
      </div>
      <div class="px-4">
        <a href="https://github.com/litgh/dberd" target="_blank">
          <Icon size="20">
            <i-tabler-brand-github />
          </Icon>
        </a>
      </div>
    </div>
    <div class="w-full h-[80vh] overflow-y-auto overflow-x-hidden relative">
      <SimpleCanvas ref="simpleCanvasRef" svg-class="sm:hidden lg:translate-x-[100px] translate-y-[40px] xl:translate-x-[10%]"/>
      <div
        ref="sloganRef"
        class="absolute max-w-[380px] lg:left-14 xl:right-[20%] lg:top-[60%] xl:top-[20%] text-zinc-800 z-10 text-center"
      >
        <h1
          class="text-4xl font-bold py-1 bg-gradient-to-r from-slate-700 from-10% via-slate-500 to-slate-700 inline-block text-transparent bg-clip-text"
        >
          Free & simple
        </h1>
        <div class="mt-3 text-xl font-bold text-wrap">
          Easy to use Database E/R Diagramming Tool
        </div>
        <div class="mt-3 w-full flex justify-center items-center space-x-4">
          <div
            class="bg-white rounded-md py-2 xl:px-8 px-2 shadow-lg border font-bold"
          >
            Learn more
          </div>
          <div
            class="bg-zinc-800 text-white rounded-md py-2 xl:px-8 px-2 shadow-lg border font-bold"
          >
            <router-link to="/workspace">Try it for yourself!</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    class="flex flex-col xl:flex-row items-center w-full bg-gray-200 py-10 px-10"
  >
    <div class="flex w-full lg:mb-5">
      <div>
        <Icon size="24">
          <i-tabler-square-rounded-number-1-filled />
        </Icon>
      </div>
      <div class="flex-1 ml-2">
        <div class="text-xl font-medium">Create Tables</div>
        <div class="text-sm text-gray-500">Define tables and fields</div>
      </div>
    </div>
    <div class="flex w-full lg:mb-5">
      <div>
        <Icon size="24">
          <i-tabler-square-rounded-number-2-filled />
        </Icon>
      </div>
      <div class="flex-1 ml-2">
        <div class="text-xl font-medium">Add relationships</div>
        <div class="text-sm text-gray-500">
          Relationship between tables by simply dragging and dropping
        </div>
      </div>
    </div>
    <div class="flex w-full">
      <div>
        <Icon size="24">
          <i-tabler-square-rounded-number-3-filled />
        </Icon>
      </div>
      <div class="flex-1 ml-2">
        <div class="text-xl font-medium">Export</div>
        <div class="text-sm text-gray-500">
          Export to various formats such as PNG, SVG, PDF, SQL, etc.
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col py-10">
    <div class="text-4xl font-bold text-center py-4">Features</div>
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-x-10 gap-y-6 px-14 mt-4">
      <div
        v-for="f in features"
        class="px-8 py-8 bg-white rounded-md shadow-md border border-t-blue-800 border-t-8 hover:transition-transform hover:scale-105"
      >
        <div class="text-xl font-bold/90">{{ f.title }}</div>
        <div class="mt-2 text-sm text-gray-500">{{ f.description }}</div>
      </div>
    </div>
  </div>
  <div class="flex flex-col py-10 bg-gray-200 w-full mt-10">
    <div class="text-4xl font-bold text-center py-8">We support these DBMS</div>
    <div
      class="flex flex-col xl:flex-row lg:space-y-8 xl:space-x-20 justify-center items-center"
    >
      <img
        v-for="db in dbms"
        :src="'/src/assets/' + db + '.png'"
        class="h-20 opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200"
      />
    </div>
  </div>
  <div class="w-full bg-white text-center py-4">
    © 2024 Dberd - All rights reserved
  </div>
</template>
<script setup>
import SimpleCanvas from "@/components/landingpage/SimpleCanvas.vue";
import Icon from "@/components/Icon.vue";
import { ref } from "vue";

const simpleCanvasRef = ref();
const sloganRef = ref();
const features = [
  {
    title: "Export",
    description:
      "Export the DDL script or export the diagram as an image or JSON",
  },
  {
    title: "Keyboard shortcuts",
    description: "Keyboard shortcuts for common actions",
  },
  {
    title: "Customizable Table View",
    description: "Customize the table view to show or hide columns",
  },
  {
    title: "Robust editor",
    description: "Undo, redo, copy, paste, duplicate, lock, unlock and more",
  },
  {
    title: "Automatic alignment",
    description: "Drag and drop tables automatic alignment to others",
  },
  {
    title: "Relational database support",
    description: "Support for MySQL, PostgreSQL, SQLite and SQL Server",
  },
];
const dbms = ["mysql", "postgres", "sqlite", "sql-server"];
</script>
<style></style>
