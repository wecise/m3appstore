<template>
    <el-container>
        <el-main style="padding:0px;">
        <el-tabs value="deploy" type="border-card">
            <el-tab-pane name="deploy">
                <span slot="label">应用发布</span>
                <AppDeploy></AppDeploy>
            </el-tab-pane>
            <el-tab-pane name="install">
                <span slot="label">应用安装</span>
                <AppInstall></AppInstall>
            </el-tab-pane>
            <el-tab-pane name="container">
                <span slot="label">容器信息</span>
                <AppSummary></AppSummary>
            </el-tab-pane>
        </el-tabs>
    </el-main>
    </el-container>
</template>

<script>

import AppDeploy from './AppDeploy';
import AppSummary from './AppSummary';
import AppInstall from './AppInstall';

export default{
    name: "AppView",
    components: {
        AppDeploy,
        AppSummary,
        AppInstall
    },
    data(){
        return {
            
        }
    }
}
</script>

<style scoped>
    
    .el-tabs--border-card {
        background: #fff;
        border: unset;
        box-shadow: unset;
    }
    
</style>

<style>
    .el-tabs--border-card>.el-tabs__header {
        background-color: #f2f2f2!important;
        border-bottom: 1px solid #f2f2f2!important;
    }
</style>