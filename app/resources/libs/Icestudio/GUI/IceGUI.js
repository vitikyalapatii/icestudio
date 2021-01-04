/*jshint unused:false*/
'use strict';
class IceGUI {

    constructor() {
        this.vdom = [];
        this.dom = {
            root: this.el('body'),
            menu: this.el('#menu'),
            footer: this.el('.footer.ice-bar')
        };
    
       this.sandbox();
       this.registerEvents();
    }

    sandbox(){

       this.dom.height=window.innerHeight - 
                        (this.elHeight(this.dom.menu) + 
                        this.elHeight(this.dom.footer));
       this.dom.width=window.innerWidth;
       
       document.documentElement.style
       .setProperty('--sandbox-height', `${this.dom.height}px`);

       document.documentElement.style
       .setProperty('--sandbox-footer-height', `${this.elHeight(this.dom.footer)}px`);
       
       document.documentElement.style
       .setProperty('--sandbox-menu-height', `${this.elHeight(this.dom.menu)}px`);
       
       document.documentElement.style
       .setProperty('--sandbox-menu-plus-footer-height', `${this.elHeight(this.dom.menu) + this.elHeight(this.dom.footer)}px`);

       document.documentElement.style
       .setProperty('--sandbox-width', `${this.dom.width}px`);

      /* Only for debug purpouses, check if styles are correct */
      let cssComp= getComputedStyle(document.documentElement);
      let cssSandbox = { height: cssComp.getPropertyValue('--sandbox-height'),
                         width:  cssComp.getPropertyValue('--sandbox-width')

                        }; 
      console.log('SANDBOX',cssSandbox);
    }
    registerEvents(){
        
        let _this=this;

        window.addEventListener('resize', function(){

            _this.sandbox();
        });
    }

    createRootNode(args) {
        let id = args.id;
        let conf = args.node;
        let vnode = {
            key: id,
            initial: conf,
            parent: false,
            updated: false,
            rendered:false,
            stylesheet:false,
            html:false
        };

       console.log(`GUI::createNode::${id}`, conf);
       if(typeof args.stylesheet !== 'undefined'){
           vnode.stylesheet = args.stylesheet;
       }
       if(typeof args.initialContent !== 'undefined'){
           vnode.html = args.initialContent;
       }
 
       this.vdom.push( vnode);

        this.update();
    }

    el(selector) {

        let selectorType = 'querySelectorAll';
        let multiple = true;
        if (selector.indexOf('#') === 0) {
            selectorType = 'getElementById';
            selector = selector.substr(1, selector.length);
            multiple = false;
        }
        let list = document[selectorType](selector);
        if (multiple && list.length === 1) list = list[0];
        return list;
    };

    elToggleClass(el, classname) {
        if (el.classList) {
            el.classList.toggle(classname);
        } else {
            if (elHasClass(el, classname)) {

                elRemoveClass(el, classname);
            } else {
                elAddClass(el, classname);
            }

        }
    }
    elHasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        }
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }

    elAddClass(el, className) {
        if (el.classList) {
            el.classList.add(className)
        } else if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }

    elRemoveClass(el, className) {
        if (el.classList) {
            el.classList.remove(className)
        } else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }

    elHeight(el) {
        let style = window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle;

        return el.offsetHeight + (parseInt(style.marginTop) || 0) + (parseInt(style.marginBottom) || 0);

    }

    update() {
        
        let nodes=this.vdom.length;
        console.log('Actualizando',this,nodes);
        for(let i=0;i<nodes;i++){
            if(this.vdom[i].updated ===false){
                this.render(i);
                this.vdom[i].updated=true;
            }
        }
    }
    
    computeCss(node){
    
        let css={};
    
        css.color = node.color || false;
        css['background-color'] = node['background-color'] || false;
        css.position = node.size.position || false;
        css.width = node.size.width || false;
        css.height = node.size.height || false;
        css.left = node.position.left || false;
        css.right = node.position.right || false;
        css.top = node.position.top || false;
        css.bottom = node.position.bottom || false;
        css['z-index'] = node.position['z-index'] || 555;

        if(css.height){
            css.height=`calc(${css.height} - var(--sandbox-menu-plus-footer-height))`;
        }
       
        if(css.top){
            css.top=`calc(${css.top} + var(--sandbox-menu-height))`;
        }
        
        if(css.bottom){
            css.bottom=`calc(${css.bottom} + var(--sandbox-footer-height))`;
        }


        let cssTxt='';
        for(let prop in css){
            if( css[prop]) cssTxt=`${cssTxt}${prop}:${css[prop]};`;
        }
        return cssTxt;
    }

    render(index){
        let node = this.vdom[index];
        let id  = this.vdom[index].key;
        
        if(node.rendered ===false){
         let embededStyle=this.computeCss(node.initial);
         let html=`<div id="${id}" style="${embededStyle}"></div>`;        
         
         this.vdom[index].rendered=true;
         this.dom.root.insertAdjacentHTML('beforeend',html);
         this.dom[id]=this.el(`#${id}`);
         let wrapper = document.createElement('div');
         wrapper.setAttribute('class','wrapper');
        
         if(node.html){
             console.log('HTML',node.html);
             wrapper.innerHTML=node.html;
         }

         let shadow = this.dom[id].attachShadow({mode: 'open'});
         if(node.stylesheet){
            let style = document.createElement('style');

            style.textContent = node.stylesheet;
            shadow.appendChild(style);
         }
         shadow.appendChild(wrapper);
        }
    }

}