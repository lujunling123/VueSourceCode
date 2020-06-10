
// 实现observe（数据监听/劫持）
class Observe {
    constructor(data){
        if(!data || typeof(data)!=="object"){
            return
        }
        this.data = data
        // 对data中的每个属性添加一个defineProperty
        this.winks()
    }
    winks(){
        for(var key in this.data){
            this.observeReactive(this.data, key, this.data[key])
        }
    }
    observeReactive(obj, key, value){
        new Observe(value)
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            // 在getter中收集依赖，在setter中通知依赖更新
            get (){
                // 可观测的数据被获取时会触发getter属性，那么我们就可以在getter中收集这个依赖
                dep.depend()
                return value
            },
            set (newValue){
                // 当这个数据变化时会触发setter属性，那么我们就可以在setter中通知依赖更新
                if(value===newValue){
                    return
                }
                value = newValue
                // 通知视图更新 区分出 需要渲染的视图
                dep.notify()
            }
        })
    }
}