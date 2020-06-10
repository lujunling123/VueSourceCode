class Dep {
    constructor(){
        this.subs = []
    }
    addSub(sub){
        this.subs.push(sub)
    }
    removeSub(sub){
        remove(this.subs, sub)
    }
    depend(){
        if(window.target){
            this.addSub(window.target)
        }
    }
    // 通知所有依赖更新
    notify(){
        // if(){}
        this.subs.forEach((sub) => {
            sub.update();
        })
    }

}
function remove (arr, item) {
    if (arr.length) {
      const index = arr.indexOf(item)
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
}