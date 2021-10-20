<template>
    <el-container style="height:calc(100vh - 135px);">
        <el-header style="line-height: 60px;">
            <el-tooltip content="刷新">
                <el-button type="default" icon="el-icon-refresh" @click="onRefresh">刷新</el-button> 
            </el-tooltip>
            <el-tooltip content="应用发布">
                <el-button type="success" icon="el-icon-plug" @click="onNewAppDeploy">应用发布</el-button>
            </el-tooltip>

        </el-header>
        <el-main style="overflow:hidden;">
            <el-table
                :data="deploy.dt.rows"
                :highlight-current-row="true"
                :row-class-name="rowClassName"
                ref="table"
                stripe
                border
                class="deploy-app-table"
                style="width:100%;"
                height="calc(100vh - 215px)"
                v-if="deploy.dt.rows">
                <template v-for="(item,index) in deploy.dt.columns">
                    <el-table-column
                        :prop="item.field"
                        :label="item.title" 
                        sortable 
                        show-overflow-tooltip
                        :key="index"
                        :width="item.width"
                        :formatter="item.render"
                        v-if="item.visible">
                        <template slot-scope="scope">
                            <div style="height:30px;line-height:30px;" v-if="item.field=='tags'">
                                <TagView domain='app' :model.sync="scope.row.tags" :id="scope.row.id" :limit="1"></TagView>
                            </div>
                            <div style="height:30px;line-height:30px;" v-else-if="item.field=='icon'">
                                <span :class="scope.row.icon + ' app-icon'"></span>
                            </div>
                            <div style="height:30px;line-height:30px;" v-else-if="item.field=='rate'">
                                <el-rate v-model="scope.row.rate" disabled></el-rate>
                            </div>
                            <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                v-else-if="typeof item.render === 'function'">
                            </div>
                            <div v-else>
                                {{scope.row[item.field]}}
                            </div>
                        </template>
                    </el-table-column>
                </template>
                <el-table-column label="操作" width="190" fixed="right">
                    <template slot="header">
                        <el-input v-model="deploy.dt.filter" placeholder="关键字" clearable>
                        </el-input>
                    </template>
                    <template slot-scope="scope">
                        <el-button @click.native.prevent="onRunning(scope.row)" type="text" class="action-btn"><span class="el-icon-platform-eleme" style="color:#4caf50;"></span> 运行</el-button>
                        <el-button @click.native.prevent="onAppExport(scope.row)" type="text" class="action-btn"><span class="el-icon-sold-out" style="color:#4caf50;"></span> 导出</el-button>
                        <el-button @click.native.prevent="onAppDeployEdit(scope.$index, scope.row)" type="text" class="action-btn">编辑</el-button>
                        <el-button @click.native.prevent="onAppDeployDelete(scope.$index, scope.row)" type="text" class="action-btn">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog :title="dialog.appDeploy.action==='new'?'应用发布':'应用编辑'" 
                :visible.sync="dialog.appDeploy.show" 
                :destroy-on-close="true"
                :append-to-body="true"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                v-if="dialog.appDeploy.show">
                <el-form :model="dialog.appDeploy.data" 
                    :rules="dialog.appDeploy.rules" 
                    ref="appDeployForm" 
                    label-width="100px" 
                    v-if="dialog.appDeploy.data">
                    <el-tabs value="first">
                        <el-tab-pane label="应用信息" name="first">
                            <el-form-item label="源文件" prop="name">
                                <el-upload action="#"
                                    class="app-upload"
                                    drag
                                    :auto-upload="false"
                                    :show-file-list="false"
                                    :on-change="onAppDeployFilesChange">
                                    <el-button slot="trigger" size="mini" type="default">选取文件</el-button>
                                    <el-input slot="tip" v-model="dialog.appDeploy.data.name" disabled></el-input>    
                                </el-upload>
                            </el-form-item>
                            <el-form-item label="应用名称" prop="title">
                                <el-input v-model="dialog.appDeploy.data.title"></el-input>
                            </el-form-item>
                            <el-form-item label="应用版本" prop="version">
                                <el-input v-model="dialog.appDeploy.data.version" placeholder="v0.5"></el-input>
                            </el-form-item>
                            <el-form-item label="状态" prop="status">
                                <el-select v-model="dialog.appDeploy.data.status" placeholder="请选择">
                                    <el-option label="测试" value="0"></el-option>
                                    <el-option label="已发布" value="1"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="应用大小" prop="size">
                                <el-input value="dialog.appDeploy.data.size" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="开发语言" prop="language">
                                <el-input type="textarea" v-model="dialog.appDeploy.data.language"></el-input>
                            </el-form-item>
                            <el-form-item label="应用描述" prop="desc">
                                <el-input type="textarea" v-model="dialog.appDeploy.data.desc"></el-input>
                            </el-form-item>
                            <el-form-item label="文件系统" prop="dfs">
                                <el-input v-model="dialog.appDeploy.data.dfs"></el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="管理信息" name="third">
                            <el-form-item label="评分" prop="rate">
                                <el-rate
                                    v-model="dialog.appDeploy.data.rate"
                                    show-score
                                    text-color="#ff9900"
                                    score-template="{value}">
                                </el-rate>
                            </el-form-item>
                            <el-form-item label="客户端类型" prop="client_type">
                                <el-select v-model="dialog.appDeploy.data.client_type" placeholder="请选择">
                                    <el-option label="PC" value="0"></el-option>
                                    <el-option label="Mobile" value="1"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="发布类型" prop="deploy_type">
                                <el-select v-model="dialog.appDeploy.data.deploy_type" placeholder="请选择">
                                    <el-option label="应用池" value="0"></el-option>
                                    <el-option label="容器" value="1"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="安装次数" prop="count">
                                <el-input v-model="dialog.appDeploy.data.count" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="所属公司" prop="company">
                                <el-input v-model="dialog.appDeploy.data.company"></el-input>
                            </el-form-item>
                            <el-form-item label="所属公司介绍" prop="company_desc">
                                <el-input type="textarea" v-model="dialog.appDeploy.data.company_desc"></el-input>
                            </el-form-item>
                            <el-form-item label="开发者" prop="author">
                                <el-input v-model="dialog.appDeploy.data.author"></el-input>
                            </el-form-item>
                            <el-form-item label="测试人员" prop="tester">
                                <el-input v-model="dialog.appDeploy.data.tester"></el-input>
                            </el-form-item>
                            <el-form-item label="审批人" prop="auditor">
                                <el-input v-model="dialog.appDeploy.data.auditor"></el-input>
                            </el-form-item>
                            <el-form-item label="创建时间" prop="ctime">
                                <el-date-picker
                                    v-model="dialog.appDeploy.data.ctime"
                                    type="datetime"
                                    placeholder="选择日期时间"
                                    default-time="12:00:00" disabled>
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item label="修改时间" prop="mtime">
                                <el-date-picker
                                    v-model="dialog.appDeploy.data.mtime"
                                    type="datetime"
                                    placeholder="选择日期时间"
                                    default-time="12:00:00" disabled>
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item label="源码宿主" prop="hosting">
                                <el-input type="textarea" v-model="dialog.appDeploy.data.hosting"></el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="商品信息" name="second">
                            <el-form-item label="价格" prop="price">
                                <el-input-number v-model="dialog.appDeploy.data.price" :precision="2" :step="0.1"></el-input-number>
                            </el-form-item>
                            <el-form-item label="价格策略" prop="strategy">
                                <el-input type="textarea" v-model="dialog.appDeploy.data.strategy"></el-input>
                            </el-form-item>
                        </el-tab-pane>
                    </el-tabs>
                    <el-form-item>
                        <el-button type="default" @click="dialog.appDeploy.show = false;">取消</el-button>
                        <el-button type="default" @click="onResetForm" v-if="dialog.appDeploy.action==='new'">重置</el-button>
                        <el-button type="primary" @click="onAppDeployHandler" :loading="dialog.appDeploy.loading">发布</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="'应用导出 ' + dialog.appExport.data.dfs" 
                :visible.sync="dialog.appExport.show" 
                :destroy-on-close="true"
                :append-to-body="true"
                custom-class="dialog-appExport"
                v-if="dialog.appExport.show">
                <el-form :model="dialog.appExport.data" 
                    ref="appExportForm" 
                    label-width="100px" 
                    v-if="dialog.appExport.data">
                    <el-form-item label="应用名称" prop="title">
                        <el-input :value="dialog.appExport.data.title" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="版本" prop="version">
                        <el-input :value="dialog.appExport.data.version" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="作者" prop="author">
                        <el-input :value="dialog.appExport.data.author" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="文件系统" prop="dfs">
                        <el-input :value="dialog.appExport.data.dfs" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="导出内容">
                        <el-checkbox-group v-model="dialog.appExport.selected">
                            <el-checkbox label="web">WEB</el-checkbox>
                            <el-checkbox label="api">接口</el-checkbox>
                            <el-checkbox label="rule">规则</el-checkbox>
                            <el-checkbox label="class">类</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        
                        <div v-if="dialog.appExport.selected.includes('rule')">
                            <el-divider content-position="left">选择规则</el-divider>
                            <el-card>
                                <RuleView root="/" @node-click="onRuleTreeSelected"></RuleView>
                            </el-card>
                        </div>
                        
                        <div  v-if="dialog.appExport.selected.includes('class')">
                            <el-divider content-position="left">选择类</el-divider>
                            <el-card>
                                <EntityView root="/" @node-click="onEntityTreeSelected"></EntityView>
                            </el-card>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="default" @click="dialog.appExport.show = false;">取消</el-button>
                        <el-button type="primary" @click="onAppExportHandler" :loading="dialog.appExport.loading">导出</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </el-main>

    </el-container>
</template>

<script>
import _ from 'lodash';
import TagView from '../tags/TagView';
import EntityView from './EntityView.vue';
import RuleView from './RuleView.vue';

export default {
    name: 'AppDeploy',
    components: {
        TagView,
        EntityView,
        RuleView
    },
    data(){
        return {
            deploy: {
                dt: {
                    rows: [],
                    columns: [],
                    selected: [],
                    filter: ""
                },
                rowClass: {
                    type: String,
                    default: "deploy-app"
                }
            },
            dialog: {
                appExport:{
                    loading: false,
                    show: false,
                    data: null,
                    selected: ['web','api'],
                    selectedRule: [],
                    selectedClass: []
                },
                appDeploy:{
                    loading: false,
                    show: false,
                    files: null,
                    action: 'new',
                    data: {
                        name: '',
                        status: '0',
                        title: '',
                        version: '',
                        desc: '',
                        dfs: '',
                        rate: 0,
                        size: 0,
                        language: '',
                        client_type: '0',
                        deploy_type: '0',
                        price: 0.00,
                        strategy: '',
                        count: 0,
                        company: '',
                        company_desc: '',
                        author: 'wecise',
                        tester: '',
                        auditor: '',
                        ctime: _.now(),
                        mtime: _.now(),
                        hosting: ''
                    },
                    rules: {
                        name: [
                            { required: true, message: '请选择发布源文件', trigger: 'blur' }
                        ],
                        title: [
                            { required: true, message: '请输入应用名称', trigger: 'blur' },
                            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                        ],
                        version: [
                            { required: true, message: '请输入应用版本', trigger: 'blur' }
                        ],
                        language: [
                            { required: true, message: '请输入应用开发语言', trigger: 'blur' }
                        ],
                        desc: [
                            { required: true, message: '请输入应用描述', trigger: 'blur' }
                        ]
                    }
                }
            }
        }
    },
    watch:{
        'deploy.dt.filter':{
            handler(val){
                if(_.isEmpty(val)){
                    this.onRefresh();
                }else {
                    this.deploy.dt.rows = this.deploy.dt.rows.filter(data => !val || data.name.toLowerCase().includes(val.toLowerCase()))
                }
            }
        }
    },
    mounted(){
        this.initDeployedApp();
    },
    methods: {
        rowClassName({rowIndex}){
            return `${this.deploy.rowClass}-row-${rowIndex}`;
        },
        onRefresh(){
            this.initDeployedApp();
        },
        onResetForm(){
            this.$refs.appDeployForm.resetFields();
        },
        initDeployedApp(){
            let param = encodeURIComponent( JSON.stringify({action: 'r', param: null}) );
            this.m3.callFS("/matrix/m3appstore/appStore.js", param).then( (rtn)=>{
            
                this.deploy.dt.columns = [];
                try{
                    _.extend(this.deploy.dt, {columns: _.map(rtn.message.columns, (v)=>{
                        
                        if(_.isUndefined(v.visible)){
                            _.extend(v, { visible: true });
                        }
                        
                        if(_.isUndefined(v.render)){
                            return v;
                        } else {
                            return _.extend(v, { render: eval(v.render) });
                        }
                        
                    })});
                    
                    _.extend(this.deploy.dt, { rows: rtn.message.rows });
                } catch(err){
                    console.error(err)
                }

            })
        },
        // App Deploy
        onNewAppDeploy(){
            this.dialog.appDeploy.action = 'new';
            this.dialog.appDeploy.data = {
                                            name: '',
                                            status: '0',
                                            title: '',
                                            version: '',
                                            desc: '',
                                            dfs: '',
                                            rate: 0,
                                            size: 0,
                                            language: '',
                                            client_type: '0',
                                            deploy_type: '0',
                                            price: 0.00,
                                            strategy: '',
                                            count: 0,
                                            company: '',
                                            company_desc: '',
                                            author: 'wecise',
                                            tester: '',
                                            auditor: '',
                                            ctime: _.now(),
                                            mtime: _.now(),
                                            hosting: ''
                                        };    
            this.dialog.appDeploy.show = true;
        },
        onAppDeployFilesChange(file){
            this.dialog.appDeploy.data.name = file.name;
            this.dialog.appDeploy.data.size = file.size;
            this.dialog.appDeploy.file = file.raw;
        },
        onAppDeployHandler(){
            
            this.dialog.appDeploy.loading = true;
            
            let action = this.dialog.appDeploy.action === 'new' ? 'c' : 'u';

            // to class
            let toClass = ()=>{
                let param = encodeURIComponent( JSON.stringify({action: action, param: this.dialog.appDeploy.data}) );
                this.m3.callFS("/matrix/m3appstore/appStore.js", param).then( rtn=>{
                    this.dialog.appDeploy.show = false;
                    this.dialog.appDeploy.show = false;
                    this.dialog.appDeploy.loading = false;
                    this.initDeployedApp();
                    this.$message.success("应用发布成功 " + this.dialog.appDeploy.data.title || this.dialog.appDeploy.data.name);
                }).catch((err)=>{
                    console.error(err);
                    this.dialog.appDeploy.loading = false;
                });
            }
            
            // to dfs
            if(action === 'c'){
                let file = this.dialog.appDeploy.file;
                this.m3.dfsUnZip(this.dialog.appDeploy.data, file).then( rtn=>{
                    this.dialog.appDeploy.data.dfs = rtn.message[0];
                    toClass();
                }).catch(err=>{
                    this.$message.error("应用发布失败 " + err);
                    this.dialog.appDeploy.loading = false;
                });
            } else {
                toClass();
            }
            
        },
        onAppDeployEdit(index,row){
            this.dialog.appDeploy.action = 'edit';
            this.dialog.appDeploy.data = row;
            this.dialog.appDeploy.data.hosting = JSON.stringify(this.dialog.appDeploy.data.hosting);
            this.dialog.appDeploy.show = true;
        },
        onAppDeployDelete(index,row){
            
            this.$confirm(`确定要取消发布应用 ${row.name}?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {

                // in class
                let param = encodeURIComponent( JSON.stringify({action: 'd', param: row}) );
                this.m3.callFS("/matrix/m3appstore/appStore.js", param).then( ()=>{
                    
                    this.initDeployedApp();

                    // in dfs
                    this.m3.dfsDelete({parent:row.dfs,name:row.name}).then( rtn=>{
                        console.log(rtn)
                    });
                });

            }).catch(()=> {
                this.$message({
                    type: "info",
                    message: "操作已取消"
                })
            });
        },
        onRunning(row){
            let url=`/static${row.dfs}/index.html`;
            let target="_blank";
            window.open(url,target);
        },
        onAppExport(row){
            this.dialog.appExport.show = true;
            this.dialog.appExport.data = row;
        },
        onAppExportHandler(){
            
            let exportWeb = (type)=>{
                
                let param = {srcpath: this.dialog.appExport.data.dfs};
                this.m3.dfsZip(param).then(res=>{
                    let FileSaver = require('file-saver');
                    let blob = new Blob([res], {type: "application/octet-stream"});
                    const fileName = `【${type}】${window.location.host}_${window.auth.signedUser.Company.name}_${this.dialog.appExport.data.title}_${this.moment().format("YYYY-MM-DD_HH:mm:SS")}.zip`;
                    FileSaver.saveAs(blob, fileName);
                    
                    this.dialog.appExport.loading = false;

                }).catch(err=>{
                    console.error(err)
                    this.dialog.appExport.loading = false;
                })
            };

            let exportApi = (type)=>{
                this.dialog.appExport.loading = true;
                let param = {srcpath: this.dialog.appExport.data.dfs.replace(/\/app/,'/script')};
                this.m3.dfsZip(param).then(res=>{
                    let FileSaver = require('file-saver');
                    let blob = new Blob([res], {type: "application/octet-stream"});
                    const fileName = `【${type}】${window.location.host}_${window.auth.signedUser.Company.name}_${this.dialog.appExport.data.title}_${this.moment().format("YYYY-MM-DD_HH:mm:SS")}.zip`;
                    FileSaver.saveAs(blob, fileName);
                    
                    this.dialog.appExport.loading = false;

                }).catch(err=>{
                    console.error(err)
                    this.dialog.appExport.loading = false;
                })
            };

            let exportRule = (type)=>{

            };

            let exportClass = (type)=>{

            };

            this.dialog.appExport.selected.forEach(v=>{
                
                this.dialog.appExport.loading = true;

                if(v === 'web'){
                    exportWeb(v);
                } else if(v === 'api'){
                    exportApi(v);
                } else if(v === 'rule'){
                    exportRule(v);
                } else {
                    exportClass(v);
                }


            })

        },
        onEntityTreeSelected(data){
            this.dialog.appExport.selectedClass = data;
        },
        onRuleTreeSelected(data){
            this.dialog.appExport.selectedRule = data;
        }
    }
}
</script>

<style scoped>
    .app-icon{
        font-size: 20px;
        padding: 5px;
        color: #252d47;
    }

    .action-btn{
        color: #9a9ca2;
    }

</style>
<style>
    .app-upload{
        display: flex;
    }
    .app-upload .el-upload-dragger {
        background-color: #fff;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        box-sizing: border-box;
        width: 80px;
        height: 30px;
    }

    /* .deploy-app-table.el-table .el-table__body-wrapper:not(#smartGroupTable .event-list.el-table .el-table__body-wrapper) {
        overflow: auto;
        position: relative;
        height: calc(100% - 45px)!important;
    } */

    .dialog-appExport  .el-card__body{
        padding: 0px;
        margin-bottom: 20px!important;
    }
</style>
