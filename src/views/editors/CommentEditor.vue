<template>
  <div id="comment-editor">
    <div id="editor-header">
      <div class="return-to-book">
        <button @click="backToBook">返回书籍页</button>
      </div>
      <div class="header-logo"></div>
      <div class="post-book-comment">
        <button @click="UploadComment">发布</button>
      </div>
    </div>
    <div class="content-info">
      <div class="content-img">
        <a href="../book/1">
          <img id="comment-pic" :src="book.image" />
        </a>
        <el-rate
          :show-score="true"
          style="width: 150px"
          v-model="evaluate"
          :colors="colors"
          @change="starTheBook"
        >
        </el-rate>
      </div>
      <div id="content-intro">
        <span id="contentname">《{{ book.name }}》<br /></span>
        <span id="contentintro">作者：{{ book.author }}</span>
        <span id="contentstar">评分：{{ book.score }}</span>
      </div>
    </div>
    <div>
    <div id="editor" style="border: 1px solid #ccc">
      <div id="toolbar-container"></div>
      <div id="editor-container">
        <div id="title-container">
          <input v-model="title" />
        </div>
        <div id="editor-text-area"></div>
      </div>
    </div>
</div>
  </div>
</template>
<style scoped>
#comment-editor {
  padding-bottom: 200px;
  margin-bottom: 200px;
}
#editor-header {
  padding-top: 10px;
  height: 50px;
  width: 1690px;
  background-color: rgb(216, 216, 216);
}
.header-logo {
  position: absolute;
  left: 820px;
  top: 0;
  right: 800px;
  height: 50px;
  width: 50px;
  background-size: 50px 50px;
  background-image: url("@/assets/icon/logo.png");
}
.return-to-book button {
  background: none;
  outline: none;
  border: none;
  color: black;
}
.return-to-book button:hover {
  outline: none;
  font-weight: bold;
}
.post-book-comment button:hover {
  outline: none;
  font-weight: bold;
}
.post-book-comment button {
  background: none;
  position: absolute;
  top: 5px;
  right: 5px;
  margin-top: 0;
  height: 40px;
  transition: all 0.2s ease;
  border: none;
  color: black;
}
.contentinfo {
  position: absolute;
  left: 200px;
  right: 200px;
  top: 100px;
}
.content-img {
  position: absolute;
  left: 445px;
  top: 100px;
  padding-right: 400px;
  height: 150px;
  width: 800px;
}
#content-intro {
  position: absolute;
  font-family: Source Han Sans CN Normal;
  width: 600px;
  height: 152px;
  left: 555px;
  top: 100px;
  background-color: rgb(242, 242, 242);
}
#comment-pic {
  width: 110px;
  height: 150px;
}
#contentname {
  position: absolute;
  top: 20px;
  left: 15px;
}
#contentintro {
  position: absolute;
  top: 60px;
  left: 20px;
}
#contentstar {
  position: absolute;
  top: 100px;
  left: 20px;
}
#editor {
  position: relative;
  width: 900px;
  left: 400px;
  right: 400px;
  top: 250px;
  background-color: white;
}
#editor-container{
  min-height:800px;
}
#title-container {
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
}

#title-container input {
  font-size: 30px;
  border: 0;
  outline: none;
  width: 100%;
  line-height: 1;
}

#editor-text-area {
  overflow-y:scroll;
  margin-top: 20px;
}
</style>

<script>
import qs from "qs";
import { createEditor, createToolbar } from "@wangeditor/editor";
const editorConfig = {};

// 工具栏配置
const toolbarConfig = {
  excludeKeys: ["insertVideo", "fullScreen", "codeBlock", "bgColor", "color"],
};

export default {
  name: "editor",
  data() {
    var id = this.$route.query.id;
    var book = {};
    var title = "请输入标题...";
    var passage = "";
    var score = 0.0;
    return {
      id,
      book,
      title,
      passage,
      colors: ["#99A9BF", "#F7BA2A", "#FF9900"],
      score,
      evaluate:0,
    };
  },
  methods: {
    async updateContent() {
      var params = {
        book_id: this.id,
        user_id: this.$store.getters.getUser.user.id,
      };
      console.log("user:" + this.$store.getters.getUser.user.id);
      this.$axios
        .post("/book/detail", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log("书籍查询成功");
            this.book = res.data.data;
            this.evaluate = parseFloat(res.data.evaluate);
            console.log(this.evaluate);
            this.loadSuccess = true;
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    starTheBook() {
    var params = {
        user_id: this.$store.getters.getUser.user.id,
        book_id: this.id,
        score: this.evaluate
      };
      this.$axios
        .post("/book/star", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log(res.data);
            this.$message({
              message: res.data.msg,
              type: "success",
            });
            
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
  },
    backToBook() {
      this.addNavigation();
      this.$router.push({
        name: "bookdetail",
        query: { id: this.id },
      });
    },
    UploadComment() {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ){
        this.$message.error("请先登录！");
        this.backToBook();
        return;
      }
      if(this.evaluate===0) {
        this.$message.error("请先评分");
        return;
      }
      console.log("title:" + this.title);
      console.log("content" + this.passage);
      if(this.title==="请输入标题..." || this.title.length==0)
      {
          this.$message.error("请输入标题");
          return;
      }
      if(this.title.length>50)
      {
          this.$message.error("标题过长！不得超过50字");
          return;
      }
      if(this.passage.length>10000)
      {
        this.$message.error("字数过多！");
        return;
      }
      if(this.passage.length<25)
      {
        this.$message.error("评论正文至少25个字符");
        return;
      }
      var params = {
        user_id: this.$store.getters.getUser.user.id,
        book_id: this.id,
        title:this.title,
        text:this.passage,
      };
      this.$axios
        .post("/book/passage", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log(res.data);
            this.$message({
              message: res.data.msg,
              type: "success",
            });
            this.backToBook();
          } else {
            this.$message.error("发布失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });

    },
    addNavigation() {
      this.$parent.navigate = true;
    },
    removeNavigation() {
      this.$parent.navigate = false;
    },
    createEditor() {
      editorConfig.onChange = (editor) => {
        // 当编辑器选区、内容变化时，即触发
        console.log("html", editor.getHtml());
        this.passage = editor.getHtml();
      };
      editorConfig.scroll = true;
      const editor = createEditor({
        selector: document.querySelector("#editor-container"),
        config: editorConfig,
        mode: "simple", // 或 'simple' 参考下文
      });
      // 创建工具栏
      const toolbar = createToolbar({
        editor,
        selector: document.querySelector("#toolbar-container"),
        config: toolbarConfig,
        mode: "simple", // 或 'simple' 参考下文
      });
      console.log(toolbar.getConfig().toolbarKeys);
      document
        .getElementById("editor-text-area")
        .addEventListener("click", (e) => {
          if (e.target.id === "editor-text-area") {
            editor.blur();
            editor.focus(true); // focus 到末尾
          }
        });
    },
  },
  mounted() {
    this.removeNavigation();
    this.updateContent();
    this.createEditor();
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁编辑器
  },
};
</script>