<template>
  <div class="passage">
    <search></search>
    <div class="passage-body">
      <el-dropdown class="more-action">
        <span class="el-dropdown-link">
          <img src="@/assets/guide/more.png" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            ><a @click="deleteArticle()">删除</a></el-dropdown-item
          >
          <el-dropdown-item><a @click="jubaoForm()">举报</a></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dialog
        title="发起举报"
        :visible.sync="dialogFormVisible"
        width="800px"
        @close="closeForm()"
      >
        <el-form :model="jubao">
          <el-form-item label="标题">
            <el-input v-model="jubao.title" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="正文">
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入举报理由"
              v-model="jubao.content"
            >
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="commitjubao()">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog
        title="删除文章"
        :visible.sync="trydelete"
        width="300px"
        @close="trydelete = false"
      >
        <span>确认要删除？</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="trydelete = false">取 消</el-button>
          <el-button type="primary" @click="deleteNow()">确 定</el-button>
        </span>
      </el-dialog>
      <div v-if="loadSuccess" class="content-body">
        <div class="title">{{ passage.title }}</div>
        <div class="passage-info">
          <div>
            <a class="userOfpassage" href="/otherusers/1">
              <img class="iconOfuser" :src="userIcon" />
              <span class="nameOfuser">{{ passage.username }}</span>
            </a>
            <span class="normal">&ensp;评论了</span>
            <a class="comment-book-name">《{{ source.name }}》 </a>
            <span class="normal">{{ passage.date }}</span>
          </div>
          <div class="rate">
            <el-rate
              v-model="passage.star"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
              disabled-void-color="ffffff"
            >
            </el-rate>
          </div>
        </div>
        <div class="passage-text" v-html="passage.content"></div>
        <div class="user-buttons">
          <div id="like-button">
            <button v-if="like" @click="clickunlike()">
              <img src="@/assets/guide/liked.png" />
            </button>
            <button v-else @click="clicklike()">
              <img src="@/assets/guide/like.png" />
            </button>
            <span>{{ passage.like }}</span>
          </div>
          <div id="reply-button">
            <button @click="clickreply()">
              <img src="@/assets/guide/reply.png" />
            </button>
            <span>{{ passage.reply }}</span>
          </div>
          <button @click="share">
            <img id="like" src="@/assets/guide/share.png" />
          </button>
        </div>
      </div>
      <div class="aside">
        <div class="source-book">
          <a class="source-item" @click="ToTeleDetail(source.id)">
            <img class="source-img" :src="source.img" />
            <div v-if="loadSuccess" class="source-info">
              《{{ source.name }}》
              <el-rate
                v-model="source.star"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
                disabled-void-color="ffffff"
              >
              </el-rate>
              ({{ source.year }})[{{ source.nation }}]
            </div>
          </a>
        </div>
        <div class="recommend-passage">
          <div class="title">本剧集推荐评论</div>
          <ul class="recommend-list">
            <li v-for="passage in recommends" :key="passage.id">
              <a @click="ToComment(passage.id)">{{ passage.title }}</a>
            </li>
          </ul>
        </div>
        <div class="recommend-passage">
          <div class="title">该用户其他剧评</div>
          <ul class="recommend-list">
            <li v-for="passage in passages" :key="passage.id">
              <a @click="ToComment(passage.id)">{{ passage.title }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="Toreply === false" class="reply-input">
        <el-input
          type="textarea"
          placeholder="请输入回复"
          rows="6"
          v-model="textarea"
          maxlength="100"
          show-word-limit
        >
        </el-input>
        <el-button @click="Topreply()">提交</el-button>
      </div>
      <div class="reply-block">
        <div class="title">回复</div>
        <div
          class="reply-display"
          v-for="reply in replys"
          :key="reply.reply_id"
        >
          <hr />
          <div class="display-publisher">
            <a class="userOfreply" @click="toUser(reply.author_id)">
              <img class="iconOfuser" :src="displayIcon(reply.usericon)" /><span
                class="nameOfuser"
                >{{ reply.author_name }}</span
              >
            </a>
            <span class="publishtime">{{ reply.date }}</span>
          </div>
          <div class="reply-content">
            {{ reply.text }}
            <button @click="replyTo(reply)">
              <img src="@/assets/guide/sreply.png" />
            </button>
            <div
              class="sreply-display"
              v-for="sreply in reply.children"
              :key="sreply.id"
            >
              <div class="display-publisher">
                <a class="userOfreply" @click="toUser(sreply.userid)">
                  <img
                    class="iconOfuser"
                    :src="displayIcon(reply.usericon)"
                  /><span class="nameOfuser">{{ sreply.author_name }}</span>
                </a>
                <span class="publishtime">{{ reply.date }}</span>
              </div>
              <div class="reply-content">
                <a class="replied-user" @click="toUser(sreply.replyed_userid)">
                  @{{ sreply.replyed_username }}
                </a>
                {{ sreply.text
                }}<button @click="replyTo(sreply)">
                  <img src="@/assets/guide/sreply.png" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import search from "@/components/SelectSearch.vue";
import qs from "qs";
export default {
  name: "telecomment",
  components: {
    search,
  },
  data() {
    var id = this.$route.query.id;
    var source = {};
    var passage = {};
    var jubao = {
      title: "",
      content: "",
    };
    var replys = [
      {
        id: 1,
        username: "Puff",
        userIcon: "https://i.imgtg.com/2022/05/08/zDzsM.png",
        userid: 1,
        date: "2020-1-1",
        content: "说了一段很有才华的话，好多人点赞",
        reply: [
          {
            id: 3,
            username: "是我呀",
            userIcon: "https://i.imgtg.com/2022/05/08/zDzsM.png",
            userid: 3,
            date: "2022-4-1",
            replyed_username: "Puff",
            replyed_userid: 1,
            content:
              "正确的，直接的，中肯的，雅致的，客观的，完整的，立体的，全面的，辩证的，形而上学的，雅俗共赏的，一针见血‌‌​​‌‌​​​​‌‌‌​​​‌‌​​的，直击要害的",
          },
        ],
      },
      {
        id: 2,
        username: "哈哈",
        userIcon: "https://i.imgtg.com/2022/05/08/zDzsM.png",
        userid: 2,
        date: "2002-4-1",
        content:
          "凑一百字废话哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈凑一百字废话哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈\
  凑一百字废话哈哈哈哈哈哈",
        reply: [
          {
            id: 4,
            username: "嗨呀",
            userIcon: "https://i.imgtg.com/2022/05/08/zDzsM.png",
            userid: 4,
            date: "2022-4-1",
            replyed_username: "哈哈",
            replyed_userid: 1,
            content:
              "正确的，直接的，中肯的，雅致的，客观的，完整的，立体的，全面的，辩证的，形而上学的，雅俗共赏的，一针见血‌‌​​‌‌​​​​‌‌‌​​​‌‌​​的，直击要害的",
          },
          {
            id: 5,
            username: "是我呀",
            userIcon: "https://i.imgtg.com/2022/05/08/zDzsM.png",
            userid: 3,
            date: "2022-4-1",
            replyed_username: "哈哈",
            replyed_userid: 1,
            content: "确实",
          },
        ],
      },
    ];
    var like = false;
    var Toreply = false;
    var loadSuccess = false;
    return {
      id,
      userIcon: "https://i.imgtg.com/2022/05/08/zDzsM.png",
      passage,
      like,
      Toreply,
      replys,
      trydelete: false,
      text: "",
      recommends: [],
      passages: [],
      textarea: "",
      source,
      jubao,
      loadSuccess,
      dialogFormVisible: false,
    };
  },
  methods: {
    share() {
      var domUrl = document.createElement("input");
      domUrl.value = window.location.href;
      domUrl.id = "creatDom";
      document.body.appendChild(domUrl);
      domUrl.select(); // 选择对象
      document.execCommand("Copy", "false", null);
      let creatDom = document.getElementById("creatDom");
      creatDom.parentNode.removeChild(creatDom);
      this.$message({
        message: "复制成功",
        type: "success",
      });
    },
    replyTo(reply) {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ){
        this.$message.error("请先登录！");
        return;
      }
        
      var params = {
        article_id: this.id,
        author_id: this.$store.getters.getUser.user.id,
        text: this.textarea,
        reply_to: reply.reply_id,
      };
      this.$axios.post("/passage/reply", qs.stringify(params)).then((res) => {
        if (res.data.errno === 0) {
          this.$message({
            type: "success",
            message: res.data.msg,
          });
          this.textarea = "";
          this.updateReply();
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    updateReply() {
      var params = {
        article_id: this.id,
      };
      this.$axios
        .post("/passage/get_reply", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log(res.data.data);
            this.replys = res.data.data;
          } else {
            this.$message.error(res.data.msg);
          }
        });
    },
    displayIcon(url) {
      var icon = "https://i.imgtg.com/2022/05/08/zDzsM.png";
      if (url !== "") {
        var len = this.$axios.defaults.baseURL.length;
        icon = this.$axios.defaults.baseURL.substring(0, len - 4) + url;
      }
      console.log(icon);
      return icon;
    },
    Topreply() {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ){
        this.$message.error("请先登录！");
        return;
      }
      var params = {
        article_id: this.id,
        author_id: this.$store.getters.getUser.user.id,
        text: this.textarea,
        reply_to: 0,
      };
      this.$axios.post("/passage/reply", qs.stringify(params)).then((res) => {
        if (res.data.errno === 0) {
          this.$message({
            type: "success",
            message: res.data.msg,
          });
          this.textarea = "";
          this.updateReply();
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    ToComment(id) {
      this.$router.push({ name: "telecomment", query: { id: id } });
    },
    ToTeleDetail(id) {
      this.$router.push({
        name: "teledetail",
        query: { id: id },
      });
    },
    updateRelate() {
      var params = {
        user_id: this.passage.user_id,
      };
      this.$axios
        .post("/tele/mypassage", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            this.passages = [];
            var i;
            var length = 3;
            if (res.data.data.length < 3) length = res.data.data.length;
            for (i = 0; i < length; i++) {
              if (res.data.data[i].id != this.id)
                this.passages.push(res.data.data[i]);
            }
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
      params = {
        tele_id: this.source.id,
      };
      console.log(this.source.id);
      this.$axios
        .post("/tele/recommend", qs.stringify(params))
        .then((res) => {
          console.log("recommend");
          if (res.data.errno === 0) {
            this.recommends = [];
            var i;
            var length = 3;
            if (res.data.data.length < 3) length = res.data.data.length;
            for (i = 0; i < length; i++) {
              if (res.data.data[i].id != this.id)
                this.recommends.push(res.data.data[i]);
            }
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    deleteArticle() {
      var author = this.passage.user_id;
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ) {
        this.$message.error("请先登录！");
        return;
      }
      var user = this.$store.getters.getUser.user;
      var isadmin;
      var params = {
        user_id: user.id,
      };
      this.$axios
        .post("/user/isadmin", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            isadmin = parseInt(res.data.data);
            console.log(isadmin);
            if (user.id != author && isadmin === 0) {
              this.$message.error("你没有权限！");
              return;
            }
            this.trydelete = true;
          } else {
            this.$message.error("举报失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    deleteNow() {
      var params = {
        article_id: this.id,
      };
      this.$axios
        .post("/passage/delete", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            this.$message({
              type: "success",
              message: res.data.msg,
            });
            this.$router.push({ name: "video" });
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    commitjubao() {
      if (!this.jubao.title) {
        this.$message.error("请输入标题");
        return;
      }
      if (this.jubao.content.length < 15) {
        this.$message.error("举报理由不得少于15字");
        return;
      }
      var params = {
        report_title: this.jubao.title,
        report_reason: this.jubao.content,
        user_id: this.$store.getters.getUser.user.id,
        article_id: this.id,
      };
      console.log(params);
      this.$axios
        .post("/addreport", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log("查询到详情");
            this.dialogFormVisible = false;
            this.$message({
              type: "success",
              message:
                "举报成功，感谢您对维护美好环境做出的贡献，举报信息上传中",
            });
          } else {
            this.$message.error("举报失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    closeForm() {
      this.dialogFormVisible = false;
      console.log("close");
    },
    jubaoForm() {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ) {
        this.$message.error("请先登录！");
        return;
      }
      this.dialogFormVisible = true;
      console.log("open");
    },
    updateIcon() {
      if (this.passage.icon === "") return;
      var len = this.$axios.defaults.baseURL.length;
      this.userIcon =
        this.$axios.defaults.baseURL.substring(0, len - 4) + this.passage.icon;
    },
    updateLike() {
      var user = this.$store.getters.getUser.user;
      var params = {
        user_id: user.id,
        article_id: this.id,
      };
      this.$axios
        .post("/passage/iflike", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log("like");
            var iflike = parseInt(res.data.data);
            console.log(iflike);
            if (iflike === 1) this.like = true;
            else this.like = false;
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async updateComment() {
      var params = {
        article_id: this.$route.query.id,
      };
      this.$axios
        .post("/passage/telecomment", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log("查询到详情");
            this.passage = res.data.data.passage;
            this.source = res.data.data.resource;
            this.passage.star = parseFloat(this.passage.star);
            this.passage.date = this.passage.date.substring(0, 10);
            this.source.star = parseFloat(this.source.star);
            this.passage.like = parseInt(this.passage.like);
            this.like;
            this.passage.reply = parseInt(this.passage.reply);
            this.updateIcon();
            this.loadSuccess = true;
            this.updateRelate();
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    clicklike() {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ) {
        this.$message.error("请先登录");
        return;
      }
      this.passage.like++;
      this.like = true;
      var user = this.$store.getters.getUser.user;
      var params = {
        user_id: user.id,
        article_id: this.id,
      };
      this.$axios
        .post("/passage/like", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log(res.data.msg);
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    clickunlike() {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ) {
        this.$message.error("请先登录");
        return;
      }
      this.passage.like--;
      this.like = false;
      var user = this.$store.getters.getUser.user;
      var params = {
        user_id: user.id,
        article_id: this.id,
      };
      this.$axios
        .post("/passage/unlike", qs.stringify(params))
        .then((res) => {
          if (res.data.errno === 0) {
            console.log(res.data.msg);
          } else {
            this.$message.error("查询失败");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    clickreply() {
      if (
        !this.$store.getters.getUser ||
        this.$store.getters.getUser.user.id === -1
      ){
        this.$message.error("请先登录！");
        return;
      }
      if (this.Toreply === false) this.Toreply = true;
      else this.Toreply = false;
    },
    toUser(id) {
      this.$router.push({
        name: "user",
        query: { id: id },
      });
    },
  },
  mounted() {
    this.updateComment();
    this.updateLike();
    window.onscroll = function (e) {
      console.log("slide");
      var vertical = document.getElementsByClassName("content-body").item(0);
      var pos = vertical.getBoundingClientRect();
      console.log(pos.top);
      if (pos.top < 29) {
        var aside = document.getElementsByClassName("aside").item(0);
        if (aside != null) aside.setAttribute("class", "aside-slide");
      } else {
        var aside = document.getElementsByClassName("aside-slide").item(0);
        if (aside != null) aside.setAttribute("class", "aside");
      }
    };
  },
};
</script>
<style scoped>
.passage {
  width: 1600px;
  padding-left: 100px;
}
.passage-body {
  width: 1580px;
  padding-bottom: 50px;
  display: flex;
  flex-wrap: wrap;
}
.content-body {
  padding-top: 20px;
  padding-left: 80px;
  padding-right: 35px;
  margin-top: 80px;
  width: 1160px;
  background-color: white;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(181, 181, 181);
  box-shadow: 0px 2px 3px #888888a6;
}
.title {
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  text-align: left;
  font-size: 24px;
  font-weight: bold;
  padding-left: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
}
.iconOfuser {
  height: 30px;
  width: 30px;
  margin-right: 5px;
  vertical-align: sub;
}
.nameOfuser {
  font-family: Source Han Sans CN Normal;
  font-size: 17px;
}
.passage-info {
  color: rgb(157, 157, 157);
  display: flex;
}
.rate {
  position: relative;
  top: 8px;
  margin-left: 20px;
}
.passage-info a {
  font-weight: 500;
  font-size: 16px;
  color: black;
  text-decoration: none;
}
.passage-info a:hover {
  color: rgb(0, 166, 255);
}
.passage-text {
  margin-top: 10px;
  padding-bottom: 50px;
  padding-left: 30px;
  padding-right: 60px;
}
.passage-text >>> img {
  display: block;
  margin-left: 12px;
  width: 920px;
  border-radius: 3px;
}
.passage-text >>> {
  font-size: 17px;
  line-height: 32px;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}
.passage-text >>> span {
  font-size: 17px !important;
  line-height: 32px !important;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif !important;
}

.user-buttons {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  margin-left: 700px;
  font-size: 20px;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}
.user-buttons img {
  height: 30px;
}
.user-buttons button {
  border-radius: 40px;
  background: none;
  border: none;
  outline: none;
  position: relative;
  z-index: 0;
  margin-left: 20px;
}
.user-buttons button::before {
  position: absolute;
  content: "";
  transition: all 0.3s ease;
  border-radius: 10px;
  z-index: -1;
}
.user-buttons button:hover::before {
  top: 0;
  height: 100%;
}

.user-buttons button:active {
  top: 2px;
}
#like-button {
  width: 100px;
  display: flex;
}
#reply-button {
  width: 100px;
  display: flex;
}
.reply-input {
  margin-top: 30px;
  width: 860px;
  margin-left: 150px;
  margin-right: 150px;
  border-radius: 6px;
  box-shadow: 0px 2px 3px #888888a6;
}
.reply-block {
  margin-top: 60px;
  width: 1160px;
  padding-left: 100px;
  padding-right: 100px;
  padding-bottom: 30px;
  background-color: white;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(181, 181, 181);
  box-shadow: 0px 2px 3px #888888a6;
}
.reply-block a:hover {
  color: rgb(0, 166, 255);
}
a.replied-user {
  color: rgb(0, 166, 255);
}
.display-publisher {
  margin-top: 0;
  padding-top: 0;
  width: 820px;
}
.publishtime {
  padding-left: 20px;
  font-weight: 400;
  color: rgb(157, 157, 157);
}
.reply-content {
  margin-left: 20px;
  padding-bottom: 20px;
}
.reply-content {
  margin-left: 20px;
  padding-bottom: 20px;
}

.reply-content img {
  height: 20px;
}
.reply-content button {
  border-radius: 40px;
  background: none;
  border: none;
  outline: none;
  position: relative;
  z-index: 0;
  margin-left: 20px;
}
.reply-content button::before {
  position: absolute;
  content: "";
  transition: all 0.3s ease;
  border-radius: 10px;
  z-index: -1;
}
.reply-content button:hover::before {
  top: 0;
  height: 100%;
}

.reply-content button:active {
  top: 2px;
}
.sreply-display {
  margin-top: 5px;
  padding-top: 5px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 4px;
  background-color: #dfdede55;
}
.aside {
  margin-top: 80px;
  margin-left: 10px;
  margin-right: 0;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 25px;
  border-style: solid;
  position: absolute;
  left: 1260px;
  border-width: 1px;
  border-color: rgb(181, 181, 181);
  background-color: white;
  box-shadow: 0px 2px 3px #888888a6;
  height: 550px;
}
.aside-slide {
  margin-top: 80px;
  margin-left: 10px;
  margin-right: 0;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 25px;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(181, 181, 181);
  background-color: white;
  box-shadow: 0px 2px 3px #888888a6;
  height: 550px;
  position: fixed;
  left: 1260px;
  top: -50px;
}
.source-item {
  display: flex;
}
.source-img {
  width: 85px;
  margin-right: 20px;
}
.source-info {
  margin: auto;
  font-size: 15px;
  line-height: 30px;
  font-family: Source Han Sans CN Normal;
}
.source-book a {
  margin-left: 10px;
  margin-right: 10px;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  border-radius: 5px;
  background-color: #dfdede55;
  margin-top: 10px;
  width: 300px;
  height: 140px;
}
.source-book a:hover {
  background-color: #91919155;
}
.recommend-list a {
  color: rgb(2, 98, 182);
  font-weight: 500;
}
.recommend-list a:hover {
  background-color: rgb(213, 230, 245);
  color: rgb(2, 98, 182);
  font-weight: 600;
}
.more-action {
  position: absolute;
  left: 1165px;
  top: 315px;
}
.more-action img {
  height: 30px;
  width: 30px;
}
</style>