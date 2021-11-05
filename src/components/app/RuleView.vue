<template>
    <el-container>
        <el-header style="height:auto;line-height:40px;min-height:40px;background: #f2f2f2;">
            <el-checkbox v-model="control.ifCheckStrictly" label="节点关联"></el-checkbox>
        </el-header>
        <el-main>
            <el-tree :data="treeData" 
                    :props="defaultProps" 
                    node-key="key"
                    highlight-current
                    accordion
                    show-checkbox
                    @node-click="onNodeClick"
                    @check="onNodeClick"
                    :filter-node-method="onNodeFilter"
                    :check-strictly="!control.ifCheckStrictly"
                    :expand-on-click-node="true"
                    auto-expand-parent
                    :default-expanded-keys="defaultExpandedKeys"
                    style="background:transparent;"
                    ref="tree">
                <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                    <span v-if="data.dir">
                        <i class="el-icon-timer" style="color:#FFC107;" v-if="pickTypeFromLabel(node.label,'jobs')"></i>
                        <i class="el-icon-bank-card" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'rules')"></i>
                        <i class="el-icon-s-platform" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'hosts')"></i>
                        <i class="el-icon-lock" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'lock')"></i>
                        <i class="el-icon-warning" style="color:#FFC107;" v-else-if="pickTypeFromLabel(node.label,'notify')"></i>
                        <i class="el-icon-folder" style="color:#FFC107;" v-else></i>
                        <span v-if="node.label==='/'"> 我的配置({{data.nodes.length}})</span>
                        <span v-else> {{ pickLabel(node.label) }}({{data.nodes.length}})</span>
                    </span>
                    <span v-else>
                        <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                        <span draggable="true"  @dragstart="onDragStart(data,$event)" @dragend="onDragEnd($event)"> {{ pickLabel(node.label) }}</span>
                    </span>
                </span>  
            </el-tree>
        </el-main>
    </el-container>
</template>
<script>
import _ from 'lodash';

export default {
    props:{
        root: String
    },
    data(){
        return {
            control: {
                ifCheckStrictly: false
            },
            auth: window.auth,
            defaultProps: {
                children: 'nodes',
                label: 'key'
            },
            treeData: [],
            defaultExpandedKeys: ["/"],
            filterText: ""
        }
    },
    computed:{
        rootPath(){
            return this.root?this.root:["",this.auth.signedUser.Company.ospace].join("/");
        }
    },
    mounted(){
        this.initData();
    },
    methods: {
        pickTypeFromLabel(label,value){
            return _.endsWith(label,value);
        },
        pickLabel(label){
            return _.last(label.split("/"));
        },
        initData(){
            let root = this.rootPath;
            this.m3.ruleGet(root).then( (rtn)=>{
                this.treeData = [rtn.message];
            });
        },
        onMouseEnter(item){
            this.$set(item, 'show', true)
            this.$refs.tree.setCurrentKey(item.key);
        },
        onMouseLeave(item){
            this.$set(item, 'show', false)
        },
        onNodeFilter(value, data) {
            if(!value) return true;
            
            return data.key.indexOf(value) !== -1;
        },
        onCollapseAll(){
            _.forEach(this.$refs.tree.store._getAllNodes(), (v)=>{
                this.$set(v, 'expanded', false);
            })
        },                      
        onRefresh(data){
            this.m3.ruleGet(data.key).then( (rtn)=>{
                this.$set(data, 'nodes', rtn.message.nodes);
            });
        },
        onNodeClick(data){
            
            this.$emit("node-click",data);
            
            this.onRefresh(data);

        }
    }    
}
</script>