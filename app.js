//BUDGET CONTROLLER
var budgetController=(function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage=-1;
    };
    
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
        this.percentage=Math.round((this.value/totalIncome)*100)
        }
        else{
            this.percentage=-1;
        }
    };
    
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };
       var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }; 
    var Saving=function(id, description, value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
       var calculateTotal=function(type){
           var sum=0;
           data.allItems[type].forEach(function(cur){
               sum+=cur.value;
               /*
               [200 400 100]
               sum=0+200
               sum=200+400
               sum=600+100
               */
           });
           data.totals[type]=sum;
       };
    
       var data={
           allItems:{
               exp:[],
               inc:[],
               sav:[],
           },
           totals:{
               exp:0,
               inc:0,
               sav:0
       },
           budget:0,
           percentage:-1
       };
    
       return{
           addItem:function(type, des, val){
               var newItem, ID;
               
               ID = 0;
               //[1 2 3 4 5] next ID is 6;
               //[1 2 6 7 8] next ID is 9;
               //ID=last ID + 1;
               //Create new ID
               if(data.allItems[type].length>0){
               ID = data.allItems[type][data.allItems[type].length-1].id+1;
               }
               else{
                   ID = 0;
               }
               
               //Create new Item based on 'inc' or 'exp' type
               if(type==='exp'){
               newItem=new Expense(ID, des, val);
           }
               else if(type==='inc'){
                   newItem=new Income(ID, des, val);
               }
               else if(type==='sav'){
                   newItem=new Saving(ID, des, val)
               }
               
               //Push it into our data structure
        data.allItems[type].push(newItem);
               //Return the new element
               return newItem;
            
       },
           deleteItem: function(type, id){
               //id=3
               //data.allItems[type][id]
               //ids=[1 2 6 7 8] ;
               //index=3
               
               var ids= data.allItems[type].map(function(current){
                   return current.id;
               });
               index=ids.indexOf(id);
               if(index!==-1){
                   data.allItems[type].splice(index, 1)
               }
           },
           calculateBudget: function(){
               //Calculate total income and expences
               calculateTotal('exp');
               calculateTotal('inc');
               calculateTotal('sav');
               //Calculate the budget:income-expence
               data.budget=data.totals.inc-data.totals.exp-data.totals.sav ;
               //Calculate the percetage of income that we spent
               if(data.totals.inc>0){
               data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
               }
               else{
                   data.percentage=-1;
               }
             
           },
           calculatePercentages:function(){
               /*
               a=20
               b=10
               c=40
               income=100
               a=20/100=20%
               b=10/100=10%
               c=40/100=40%
               */
               data.allItems.exp.forEach(function(cur){
                   return cur.calcPercentage(data.totals.inc);
               });
           },
           getPercentages:function(){
               var allPerc=data.allItems.exp.map(function(cur){
                   return cur.getPercentage();
               })
               return allPerc; 
           },
           
           
           getBudget:function(){
             return{
               budget:data.budget,
               totalSav:data.totals.sav,
               totalInc:data.totals.inc,
               totalExp:data.totals.exp,
               percentage:data.percentage,
           }  
           },
           
           testing: function(){
               console.log(data);
           }
       }
})(); 
    

//UI CONTROLLER
var UIController=(function(){
    
    var DOMstrings = {
        inputType:'.add__type',
        inputDescription: '.add__description', 
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month',
        savingsLabel:'.savings--val',
        savingsContainer:'.savings__list'
    }
      var formatNumber=function(num, type){
            var numSplit, int, dec
            /** + or - before the number
            exactly 2 decimal points
            coma separating the thousands
            2310.4567--- 2,310.46
            2000  ----- 2,000.00
            **/
            num=Math.abs(num);
            num=num.toFixed(2);
            numSplit=num.split('.')/// returns an array with 2 strings, [before dot, after dot] if 3560.97 [3560, 97]
            int=numSplit[0];
            if(int.length>3){
                int=int.substr(0, int.length-3)+','+int.substr(int.length-3, 3); //input 2310, output 2,310, //result if 568739 the result will be 568,
                
            }
            
            dec=numSplit[1];
            
            return (type==='exp' ? '-':'+') + ' ' + int+'.' +dec;
        };
    var nodeListForEach=function(list, callback){  //[21 23 5 18],   i 0 1 2 3  , callback(21, 0)
                for(var i=0;i<list.length;i++){
                    callback(list[i], i);
                }
            };
    return{
        getInput:function(){
            return{
             type:document.querySelector(DOMstrings.inputType).value,//will be either 'inc' or 'exp' or'sav'
             description:document.querySelector(DOMstrings.inputDescription).value,
             value:parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        clearFields: function(){
            var fields, fieldsArray
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue)
            
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = ""
                
            });
            fieldsArray[0].focus();
        },
        displayBudget:function(obj){
            obj.budget>0 ? type='inc':type='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.savingsLabel).textContent=formatNumber(obj.totalSav, 'sav');
            if(obj.percentage>0){
document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%'; 
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---'
            }
        },
        displayPercentages:function(percentages){
            var fields=document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0){
                current.textContent=percentages[index]+'%';
                }
                else{
                    current.textContent='---'
                }
            })
        },
      displayMonth:function(){
          var now, year,months, month;
          
          now=new Date();
          months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          //var christmas=new Date(2016, 11, 25);
          month=now.getMonth();
          
          year=now.getFullYear();
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
      },
        changeType:function(){
            var fields=document.querySelectorAll(
            DOMstrings.inputType + 
                ',' + DOMstrings.inputDescription+
                ','+DOMstrings.inputValue);
            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            })
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
      /*  ctrlAddClass:function(){
            document.querySelector(DOMstrings.savingsBtn).classList.add('active');
            var div=document.querySelector(DOMstrings.inputType);
            div.parentNode.removeChild(div);
            var des=document.querySelector(DOMstrings.inputDescription);
            des.remove();
        },*/
     getDOMstrings:function(){
    
         return DOMstrings;
     }, 
        addListItem:function(obj, type){
            var html, newHtml, element
             
            
            //1. Create HTML string with placeholder text;
            if(type==='inc'){
                element = DOMstrings.incomeContainer;
             html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type==='exp'){
                element = DOMstrings.expensesContainer;
            html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else{
                element=DOMstrings.savingsContainer;
                html= '<div class="item clearfix" id="sav-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //2. Replace the placeholder text with some actual data
            newHtml= html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem:function(selectorID){
            var element=document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        }
    
    }
})();

//GLOBAL APP CONTROLLER
var controller=(function(budgetCtrl, UICtrl){
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
         document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress',function(event){
        if(event.keyCode===13 || event.which===13){
        ctrlAddItem();
        }
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }
   
    var updateBudget=function(){
       
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget=budgetCtrl.getBudget();
        //3. Display the budget on UI
       UICtrl.displayBudget(budget);  
        
    }
    var updatePercentages=function(){
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        //2. Read them from the budget controller
        var percentages=budgetCtrl.getPercentages();
        //3. Update the UI
        UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem=function(){
        var input, newItem, incomeList
        var DOM = UICtrl.getDOMstrings();
        //Get input Data
          input=UICtrl.getInput();  
        if(input.description!== "" && !isNaN(input.value)&& input.value>0){
        //Add item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //Add the new item to the UI
        UICtrl.addListItem(newItem, input.type);}
        //Clear the input field
        UICtrl.clearFields();
      //Calculate and update budget
        updateBudget();
      //Calculate and update percentages
        updatePercentages();
        };
    var ctrlDeleteItem=function(event){
        var itemID, type, ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID){
            //inc-1
        splitID=itemID.split('-');
        type=splitID[0];
        ID=parseInt(splitID[1]);
        //1. Delete the item from the data structure
        budgetCtrl.deleteItem(type, ID);
        //2.Delete the item from the UI
        UICtrl.deleteListItem(itemID);
        //3. Update and show the new budget
        updateBudget();
        //Calculate and update percentages
        updatePercentages();
        }
    };
   return{
       init:function(){
           console.log('Application has started');
           UICtrl.displayMonth();
           UICtrl.displayBudget({
           budget:0,
               totalSav:0,
               totalInc:0,
               totalExp:0,
               percentage:-1,});
           setUpEventListeners();
       }
       
   };
    

    })(budgetController, UIController);

controller.init();






























































/*//BUDGET CONTROLLER
var budgetController = (function(){
   var Expence=function(id, description, value){
       this.id=id;
       this.description=description;
       this.value=value;
   };
    
    var Income = function(id, description, value){
       this.id=id;
       this.description=description;
       this.value=value;
   };
    
    
    var data={
        allItems:{
        exp:[],
        inc:[]
    },
      totals:{
        exp:0,
        inc:0
    }
    }
    return{
        
        addItem:function(type, des, val){
        var newItem, ID;
        //[1 2 3 4 5] next ID=6
        //[1 2 4 6 8] next ID=9
        //ID=last ID + 1;
        //Create new Id
            if(data.allItems[type].length>0){
        ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID=0;
            }
        //Create new item based on 'inc' or 'exp' type
        if(type==='exp'){
        newItem=new Expence(ID, des, val)
    }
    else if(type==='inc'){
        newItem=new Income(ID, des, val)
    }
    //Push it into our new data structure
    data.allItems[type].push(newItem);
    //Return the new element
    return newItem;
    }
        testing:function(){
        console.log(data);
    }
    }
    
})();

//THE UI CONTROLLER
var UICountroller = (function(){
    var DOMstrings ={
        inputType: ('.add__type'),
        inputDescription: ('.add__description'),
        inputValue: '.add__value',
        inputBtn:('.add__btn')
        
    }
    
    return{
        getInput:function(){
            return {
        type:document.querySelector(DOMstrings.inputType).value,//Will be either 'inc' or 'exp'.
        description:document.querySelector(DOMstrings.inputDescription).value, //
        value:document.querySelector(DOMstrings.inputValue).value
            };
    },
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
    
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    var setUpEventListeners = function(){
         document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress', function(event){
        if(event.keyCode===13|| event.which===13){
             ctrlAddItem();
        }
        
        
    })
    }
    var DOM=UICtrl.getDOMstrings();
    var ctrlAddItem= function(){
        var input, newItem;
      
      //1. Get the field input data
      input=UICtrl.getInput();
      
      //2. Add the item to the budget controller
      newItem=budgetCtrl.addItem(input.type, input.description, input.value);
      //3. Add the new item to the UI
       
      //4. Calculate the budget
      
      //5. Display the budget in the UI
    
      
  }
        return{
            init: function(){
                console.log('Application has started!')
                setUpEventListeners();
            }
        }
    
})(budgetController, UICountroller);

controller.init();
*/

 //calculate total income and expences
               /*var incResult, expResult, totalIncome, totalExpense
               //total income
             function getFields(input, field) {
                   var output = [];
                   for (var i=0; i < input.length ; ++i)
                     output.push(input[i][field]);
                   return output;
                       }

               incResult= getFields(data.allItems.inc, "value");
               totalIncome= incResult.reduce(function(a, b){
                   return a+b;
               }, 0);
               //total expences
               expResult = getFields(data.allItems.exp, "value");
               totalExpense = expResult.reduce(function(a, b){
                   return a+b;
               }, 0);
            //calculate the budget:income-expences
               var budget=totalIncome-totalExpense;
            //calculate the percentage of income that we spent
               var perc=Math.floor((totalExpense*100)/totalIncome)
               return{
                   budget,
                  totalIncome,
                   totalExpense, 
                   perc
                     }
                     */