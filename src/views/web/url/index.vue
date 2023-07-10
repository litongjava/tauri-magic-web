<template>
<div class="app-container">

  <!-- 搜索工作栏 -->
  <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
           label-width="68px">
    <el-form-item label="name" prop="name">
      <el-input v-model="queryParams.name" placeholder="请输入name" clearable @keyup.enter.native="handleQuery"/>
    </el-form-item>
    <el-form-item label="url" prop="url">
      <el-input v-model="queryParams.url" placeholder="请输入url" clearable @keyup.enter.native="handleQuery"/>
    </el-form-item>
    <el-form-item label="create time" prop="createTime">
      <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                      type="daterange"
                      range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                      :default-time="['00:00:00', '23:59:59']"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="el-icon-search" @click="handleQuery">search</el-button>
      <el-button icon="el-icon-refresh" @click="resetQuery">reset</el-button>
    </el-form-item>
  </el-form>

  <!-- 操作工具栏 -->
  <el-row :gutter="10" class="mb8" style="display:flex">
    <el-col :span="1.5">
      <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                 v-hasPermi="['web:url:create']">add
      </el-button>
    </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>

  <!-- 列表 -->
  <el-table v-loading="loading" :data="list">
    <el-table-column label="id" align="center" prop="id"/>
    <el-table-column label="name" align="center" prop="name"/>
    <el-table-column label="url" align="center" prop="url">
      <template v-slot="scope">
      <a :href="scope.row.url" @click.prevent="openUrl(scope.row.url)">{{
        scope.row.url
        }}</a>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" align="center" prop="createTime" width="180">
      <template v-slot="scope">
      <span>{{ parseTime(scope.row.createTime) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
      <template v-slot="scope">
      <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                 v-hasPermi="['web:url:update']">修改
      </el-button>
      <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                 v-hasPermi="['web:url:delete']">删除
      </el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页组件 -->
  <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo"
              :limit.sync="queryParams.pageSize"
              @pagination="getList"/>

  <!-- 对话框(添加 / 修改) -->
  <el-dialog :title="title" :visible.sync="open" width="500px" v-dialogDrag append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="name" prop="name">
        <el-input v-model="form.name" placeholder="请输入name"/>
      </el-form-item>
      <el-form-item label="url" prop="url">
        <el-input v-model="form.url" placeholder="请输入url"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>

export default {
  name: "Url",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // Web地址列表
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        url: null,
        createTime: [],
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    };
  },
  created() {
    const list = JSON.parse(localStorage.getItem('list'));
    if (list) {
      this.list = list;
    }
    this.getList();
  },
  watch: {
    list: {
      handler(list) {
        // 将数据存储到本地存储中
        localStorage.setItem('list', JSON.stringify(list));
      },
      deep: true // 深度监听数据变化
    }
  },

  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      this.getUrlPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        url: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加Web地址";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      this.getUrl(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改Web地址";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        // 修改的提交
        if (this.form.id != null) {
          this.updateUrl(this.form).then(response => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
          });
          return;
        }
        // 添加的提交
        this.createUrl(this.form).then(response => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.getList();
        });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除Web地址编号为"' + id + '"的数据项?').then(() => {
        debugger;
        return this.deleteUrl(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      this.$modal.confirm('是否确认导出所有Web地址数据项?').then(() => {
        this.exportLoading = true;
        return exportUrlExcel(params);
      }).then(response => {
        this.$download.excel(response, 'Web地址.xls');
        this.exportLoading = false;
      }).catch(() => {
      });
    },
    // 创建Web地址
    createUrl(item) {
      let thisId = this.list.length + 1;
      item.id = thisId;
      item.createTime = new Date();
      this.list.push(item);
      return new Promise((resolve, reject) => {
        resolve(true)
      })
    },

    // 更新Web地址
    // 更新Web地址
    updateUrl(item) {
      return new Promise((resolve, reject) => {
        const index = this.list.findIndex((el) => el.id === item.id);
        if (index !== -1) {
          // 更新对应索引的项
          this.list.splice(index, 1, item);
          resolve(true);
        } else {
          reject(new Error('找不到要更新的项'));
        }
      });
    },

    // 删除Web地址
    async deleteUrl(id) {
      const index = this.list.findIndex(item => item.id === id);
      this.list.splice(index, 1);
      return {}
    },

    // 获得Web地址
    async getUrl(id) {
      const item = this.list.find(item => item.id === id);
      return {data: item};
    },

    // 获得Web地址分页
    async getUrlPage(query) {
      // 处理查询条件
      const {name, createTime = [], pageNo = 1, pageSize = 10} = query;
      const start = createTime[0] ? new Date(createTime[0]) : null;
      const end = createTime[1] ? new Date(createTime[1]) : null;

      // 过滤符合条件的数据
      const filteredList = this.$data.list.filter(item => {
        if (name && !item.name.includes(name)) {
          return false;
        }
        if (start && new Date(item.createTime) < start) {
          return false;
        }
        if (end && new Date(item.createTime) > end) {
          return false;
        }
        return true;
      });

      // 计算分页数据
      const total = filteredList.length;
      const startIdx = (pageNo - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const list = filteredList.slice(startIdx, endIdx);

      return {data: {total, list}};
    },
    // 导出Web地址 Excel
    exportUrlExcel(query) {

    },
    openUrl(url) {
      window.open(url, '_self')
    }
  }
};
</script>
