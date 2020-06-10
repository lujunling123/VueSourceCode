class Compile {
    constructor(el, vm, data) {
      // 判断是否是元素节点，是=》取该元素 否=》取文本
      this.el = this.isElementNode(el) ? el:document.querySelector(el)
      this.vm = vm
      this.data = data
      if(this.el){
        // 将真实dom放入内存中
        let fragment = this.nodefragment2(this.el)
        // 2. 编译 =》 在fragment中提取想要的元素节点 v-model 和文本节点
        this.compile(fragment)
        // 3. 把编译好的fragment在放回到页面中
        this.el.appendChild(fragment)
      }
    }
    // 判断是否是元素节点
    isElementNode(node) {
      return node.nodeType === 1
    }
    nodefragment2(el){
        let fragment = document.createDocumentFragment()
        let firstChild
        // 遍历取出firstChild，直到firstChild为空
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment // 内存中的节点
    }
    compile(fragment){
        const textReg = /\{\{\s*\w+\s*\}\}/gi
        // 进行判断 如果是{{}}
        if(fragment.childNodes){
            fragment.childNodes.forEach(element => {
                switch(element.nodeType){
                    case 1: 
                        // 若是元素节点，则遍历它的属性，编译其中的指令
                        const attrs = element.attributes;
                        Array.prototype.forEach.call(attrs, (attr) => {
                            if (this.isDirective(attr)) {
                                CompileUtils.compileModelAttr(this.data, element, attr)
                            }
                        })
                        break
                    case 2:
                        console.log(element.nodeType)
                        break
                    case 3:
                        let textContent = element.textContent;
                        if (textReg.test(textContent)) {
                            const matchs = textContent.match(textReg);
                            CompileUtils.compileTextNode(this.data, element, matchs);
                        }
                        break
                    default:
                        console.log(element.nodeType)
                }
            });
        }
        // new Watcher(this.data, 'name1', this.vm.$data)
    }
    // 是否是属性节点
    isElementNode(node) {
        return node.nodeType === 1;
    }
    // 是否是文本节点
    isTextNode(node) {
        return node.nodeType === 3;
    }

    isAttrs(node) {
        return node.nodeType === 2;
    }
    // 检测属性是否是指令(vue的指令是v-开头)
    isDirective(attr) {
        return attr.nodeName.indexOf('v-') >= 0;
    }
    
  }
  const CompileUtils = {
    reg: /\{\{\s*(\w+)\s*\}\}/, // 匹配 {{ key }}中的key
    // 编译文本节点，并注册Watcher函数，当文本节点依赖的属性发生变化的时候，更新文本节点
    compileTextNode(vm, node, matchs) {
      // 原始文本信息
      const rawTextContent = node.textContent;
      matchs.forEach((match) => {
        const keys = match.match(this.reg)[1];
        new Watcher(vm, keys, () => this.updateTextNode(vm, node, matchs, rawTextContent));
      });
      this.updateTextNode(vm, node, matchs, rawTextContent);
    },
    // 更新文本节点信息
    updateTextNode(vm, node, matchs, rawTextContent) {
      let newTextContent = rawTextContent;
      matchs.forEach((match) => {
        const keys = match.match(this.reg)[1];
        const val = this.getModelValue(vm, keys);
        newTextContent = newTextContent.replace(match, val);
      })
      node.textContent = newTextContent;
    },
    // 编译v-model属性,为元素节点注册input事件，在input事件触发的时候，更新vm对应的值。
    // 同时也注册一个Watcher函数，当所依赖的值发生变化的时候，更新节点的值
    compileModelAttr(vm, node, attr) {
      const { value: keys, nodeName } = attr;
      console.log(vm, keys)
      node.value = this.getModelValue(vm, keys);
      // 将v-model属性值从元素节点上去掉
      node.removeAttribute(nodeName);
      new Watcher(vm, keys, (oldVal, newVal) => {
        node.value = newVal;
      });
      node.addEventListener('input', (e) => {
        this.setModelValue(vm, keys, e.target.value);
      });
    },
    /* 解析keys，比如，用户可以传入
    *  let data = {
    *    name: 'cjg',
    *    obj: {
    *      name: 'zht',
    *    },
    *  };
    *  new Watcher(data, 'obj.name', (oldValue, newValue) => {
    *    console.log(oldValue, newValue);
    *  })
    *  这个时候，我们需要将keys解析为data[obj][name]的形式来获取目标值
    */
    parse(vm, keys) {
      keys = keys.split('.');
      let value = vm;
      keys.forEach(_key => {
        value = value[_key];
      });
      return value;
    },
    // 根据vm和keys，返回v-model对应属性的值
    getModelValue(vm, keys) {
      return this.parse(vm, keys);
    },
    // 修改v-model对应属性的值
    setModelValue(vm, keys, val) {
      keys = keys.split('.');
      let value = vm;
      for(let i = 0; i < keys.length - 1; i++) {
        value = value[keys[i]];
      }
      value[keys[keys.length - 1]] = val;
    },
  }