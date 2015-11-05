define('js!SBIS3.CONTROLS.ControlHierarchyManager', [], function () {

   return {
      zIndexManager: {
         _cur: 100499,
         setFree: function (zIndex) {
            zIndex = parseInt(zIndex, 10);
            if (zIndex == this._cur) {
               this._cur -= 2;
            }
            return this._cur;
         },
         getNext: function () {
            this._cur += 2;
            return this._cur;
         }
      },

      _index: {},
      _tree: [],
      _topWindow: null,

      addNode: function (component) {
         var parent = component.getParent() || (component.getOpener instanceof Function ? component.getOpener() : null),
             id = component.getId(), node;
         //если есть парент
         if (parent  &&  parent.getId instanceof Function) {
            //то ищем узел этого парента по id
            if (this._index[parent.getId()]) {
               node = this._componentToNode(component, this._index[parent.getId()]);
               node.parent.children.push(node);
               //и индексируем новый узел
               this._index[id] = node;
            } else { //Если не нашли узел парента
               //TODO: выпилить, кода это будет реализовано в контроле
               this.addNode(parent);
               node = this._componentToNode(component, this._index[parent.getId()]);
               node.parent.children.push(node);
               //и индексируем новый узел
               this._index[id] = node;
            }
         } else {
            //если парента нет
            node = this._componentToNode(component, null);
            //создаем новый узел и проверяем нет ли его уже
            if (!this._wasAdded(node)) {
               //добавляем в дерево
               this._tree.push(node);
               //и в индекс
               this._index[id] = node;
            }
         }
      },

      removeNode: function(component){
         this._index[component.getId()] = null;
      },

      //Проверить является ли target jQuery элементом component или его детей
      checkInclusion: function (component, target) {
         var inclusion = this._checkIndexInclusion(component, target);
         if (!inclusion) {
            inclusion = this._checkParentInclusion(component, target);
         }
         return inclusion;
      },

      // Старые контролы не регистрируются в индексе
      // поэтому проверяем не лежит ли родитель контрола на нашем окне
      // TODO: Нужно рассмотреть возможность объеденить иерархии старых и новых контролов в едином механизме.
      _checkParentInclusion: function(component, target){
         var control = $(target).wsControl();
         if (control){
            var parent = control.getParent() || (component.getOpener instanceof Function ? component.getOpener() : null),
               parentContainer = parent ? parent.getContainer() : null;
            if (parentContainer && this._findContainer(component, parentContainer)){
               return true;
            } else {
               this._checkParentInclusion(component, parentContainer);
            }
         }
      },

      _findContainer: function(control, container){
         return control._container.find($(container)).length || $(control._container).get(0) == container;
      },

      _checkIndexInclusion: function(component, target){
         var node;
         node = this._index[component.getId()];
         if (node) {
            var len = node.children.length;
            if (len) {
               for (var i = 0; i < len; i++) {
                  var self = node.children[i].self;
                  if (this.checkInclusion(self, target)){
                     return true;
                  }
               }
            }
         }
         return this._findContainer(component, target);
      },

      _wasAdded: function (node) {
         for (var i = 0; i < this._index.length; i++) {
            if (node.self.getId() == this._index[i].id) {
               return true;
            }
         }
         return false;
      },

      // сделать из компонента узел
      _componentToNode: function (component, parentNode) {
         return {
            'parent': parentNode,
            'self': component,
            'children': []
         };
      },

      setTopWindow: function(window){
         this.topWindow = window;
      },

      getTopWindow: function(){
         return this.topWindow;
      }
   };

});