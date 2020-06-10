class MVVM {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    // 如果有要编译的模板 =》编译
    if(this.$el) {
      // 数据劫持 就是把对象的所有属性改成 get 和 set方法
      new Observe(this.$data)
      // 将文本+元素模板进行编译
      new Compile(this.$el, this, this.$data)
    }
  }
}