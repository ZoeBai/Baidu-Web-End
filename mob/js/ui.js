var list = [];
var pairs = {
    "收入" : ["#8adfbf", "icon-money"],
    "衣服" : ["#F49539", "icon-t-shirt"],
    "饮食" : ["#f78585", "icon-food"],
    "住宿" : ["#caba90", "icon-home"],
    "交通" : ["#66a2f0", "icon-plane"],
    "购物" : ["#d05842", "icon-basket"],
    "其他" : ["#fac803", "icon-dollar"]
};
var statusFlag = {
    edit : false,
    index : 0
};
var calculate = {
    operator : "",
    beforeCompute : 0,
    result : 0,
    addNum : 0,
    compute: function(){
        switch (this.operator){
            case "+":
                this.result = this.beforeCompute + this.addNum;
                this.beforeCompute = this.result;
                break;
            case "-":
                this.result = this.beforeCompute - this.addNum;
                this.beforeCompute = this.result;
                break;
            case "":
                this.result = this.addNum + this.beforeCompute;
                this.beforeCompute = this.result;
        }
        this.addNum = 0;
    },
    clear: function(){
        this.operator = "";
        this.beforeCompute = 0;
        this.result = 0;
        this.addNum = 0;
    }
}; 
function Account(id){
    this.name = "";
    this.value = 0;
    this.timestamp = this.setTimestamp(id);
    this.id = id ? id : Date.now();
}
Account.prototype = {
    constructor: Account,
    setName: function(name){
        this.name = name;
    },
    getName: function(){
        return this.name;
    },
    setTimestamp: function(id){
        if (id) {
            var time = new Date(id); 
        } else {
            var time = new Date();
        }        
        return time.getFullYear()%100 + "/" + (time.getMonth() + 1) + "/" +time.getDate();
    },
    getTimestamp: function(){
        return this.timestamp;
    },
    setValue: function(value){
        this.value = value;
    },
    getValue: function(){
        return this.value;
    }
};
var data = {
    totalIncome : 0, 
    totalOutlay : 0,
    category : {
        "衣服": 0,
        "饮食": 0,
        "住宿": 0,
        "交通": 0,
        "购物": 0,
        "其他": 0
    },
    month : { "收入":[0,0,0,0,0,0,0,0,0,0,0,0],"支出":[0,0,0,0,0,0,0,0,0,0,0,0] },
    history : {},
    range : { earliest: 12,
              latest: 1
    },
    loadData : function(){
        data.clearAll();
        list = JSON.parse(localStorage.list);
        var pattern = /^(\d{2})\/(\d{1,2})\//;
        for (var i = list.length-1; i >= 0; i--){
            var value = Number(list[i].value);
            var timeline = pattern.exec(list[i].timestamp);
            if (list[i].name == "收入"){
                data.totalIncome += value;
            }else{ 
                data.category[list[i].name] += value;
                data.totalOutlay += value;
            }
            if (timeline[1] == new Date().getFullYear()%100){
                if (list[i].name == "收入"){
                    data.month["收入"][timeline[2]-1] += Number(list[i].value);
                } else {
                    data.month["支出"][timeline[2]-1] += Number(list[i].value);
                }
                if(!data.history[timeline[2]]){
                    data.history[timeline[2]] = {};                 
                }
                if(!data.history[timeline[2]][list[i].name]){
                    data.history[timeline[2]][list[i].name] = [0];
                }
                data.history[timeline[2]][list[i].name].push(list[i]);
                data.history[timeline[2]][list[i].name][0] += Number(list[i].value);
                if (Number(data.range.latest) < Number(timeline[2])) {
                    data.range.latest = timeline[2];
                }
                if(Number(data.range.earliest) > Number(timeline[2])){
                    data.range.earliest = timeline[2];
                }
            }
        }
    },
    getMonthData: function(num){
        if (num < 12 && num >= 0){
            var thisMonth = data.history[num+1];
            data.clear();
            for (var item in thisMonth){
                data.category[item] =thisMonth[item][0];
            }
            data.totalIncome = data.month["收入"][num];
            data.totalOutlay = data.month["支出"][num];
        }
    },
    clear: function(){
        data.totalOutlay = 0;
        data.totalIncome = 0;
        for (var item in data.category){
            data.category[item] = 0;
        }
    },
    clearAll: function(){
        data.totalOutlay = 0;
        data.totalIncome = 0;
        for (var item in data.category){
            data.category[item] = 0;
        }        
        data.month = { "收入":[0,0,0,0,0,0,0,0,0,0,0,0],"支出":[0,0,0,0,0,0,0,0,0,0,0,0] };
        data.history = {};
        data.range = { 
            earliest: 12,
            latest: 1
        };
    }
};
var eventUtil = function(){
    return {
        handler : function(e){
            e.stopPropagation();
            var selectedIcon = $(".selected-category i");
            var selectedBg = $(".selected-category .icon");
            var that = $(this).children(".icon");
            var thatP = $(this).children("p");
            selectedIcon.attr("class", that.children("i").attr("class"));
            selectedBg.css("background-color", that.css("background-color"));
            selectedBg.next().html(thatP.html() + "<span></span>");
            calculate.clear();
            $("#keyboard").css('height', "310px");
        },
        calculator : function(e){
            e.stopPropagation();
            var money = $(".selected-category span");
            var beforeEnter = money.html();
            var enterNum = Number($(this).html());
            if (enterNum > -1) {
                if (calculate.addNum == 0 && calculate.beforeCompute) {
                    money.html("￥" + enterNum);
                } else if (beforeEnter) {
                    money.html(beforeEnter + enterNum);
                } else if (enterNum != 0){
                    money.html("￥" + enterNum);
                }
                beforeEnter = money.html();
                calculate.addNum = Number(beforeEnter.substring(1));        
            } else {
                var object = $(this);
                var operator = object.children("i").length == 1 ? object.children("i").attr("class") : object.html();
                switch (operator){
                    case ".":
                        if (beforeEnter && beforeEnter.indexOf(".") == -1) {
                            money.html(beforeEnter + ".");
                        } else if (!beforeEnter){
                            money.html("￥" + "0.");
                        }
                        break;
                    case "C":
                        money.html("");
                        calculate.clear();
                        break;
                    case "=":
                        calculate.compute();
                        calculate.operator = "";
                        money.html("￥" + calculate.result);
                        break;
                    case "icon-cancel-alt":
                        if (beforeEnter) {
                            if (beforeEnter.length > 2){
                                money.html(beforeEnter.slice(0,-1));
                            } else {
                                money.html("");
                            }                    
                        }
                        break;
                    case "icon-plus":
                        calculate.compute();
                        calculate.operator = "+";
                        money.html("￥" + calculate.result);
                        break;
                    case "icon-minus":
                        calculate.compute(); 
                        calculate.operator = "-";
                        money.html("￥" + calculate.result);
                        break;
                }
            } 
        },
        saveData : function (e){
            e.stopPropagation();
            if (statusFlag.edit){
                var data1 = new Account(list[statusFlag.index].id);
            }else {
                var data1 = new Account();
            }
            var value = $(".selected-category p").text().split("￥");
            if (value[0] && value[1]){
                data1.setName(value[0]);
                data1.setValue(value[1]);
                list = localStorage.list ? JSON.parse(localStorage.list) : [];
                if (statusFlag.edit) {
                    list[statusFlag.index] = data1;
                }else {
                    list.push(data1);
                }
                localStorage.list = JSON.stringify(list);
                calculate.clear();
                $("#keyboard").css("height","0px");
                $("#new-note").css("height","0px");
                eventUtil.load();
            } else {
                createWarn("请选择分类，输入金额！");
                setTimeout(function(){
                    $('#warnword').css('-webkit-animation', "fade1 1s linear forwards");
                },100);               
            }
        },
        edit : function (){
            $(".details.selected").toggleClass("selected");
            $(this).addClass("selected");
        },
        hideEdit : function (){
            if($(this).hasClass("selected")){
                $(this).toggleClass("selected");
            }   
        },
        deleteList : function (){
            createMask();
            createConfirm();
            var that = this;
            $("#comfirm").one('tap', "span", function(){
                var result =(this.id == "cancelBtn") ? false : true;
                $("#mask").hide();
                $("#comfirm").hide();
                if (result){
                    var id = $(that).closest('li').data("id");
                    $(that).closest("li").remove();
                    deleteData(id);
                    data.loadData();
                    loadStatistic();
                    loadGraph();
                }else{
                    $(that).closest("li").toggleClass("selected");
                }
            });   
        },
        editList : function (){
            var id = $(this).closest("li").data("id");
            var index = findData(id);   
            statusFlag.edit = true;
            statusFlag.index = index;
            $("#new-note").css("height", "100%");
            display(index);
        },
        newList : function (){
            statusFlag.edit = false;
            localStorage.statusFlag = JSON.stringify(statusFlag);
            $("#new-note").css("height","100%");
        },
        changeView : function(e){
            if (!$(this).hasClass("selected")){
                var direction = ($(".selected").data("serial") > $(this).data("serial")) ? "100%" : "-100%";
                $(".currentView").css("left",direction);
                $(".currentView").removeClass("currentView");
                $(".nav .selected").removeClass("selected");
                switch(this.className){
                    case "lb":
                        $(".list").css("left","0px");
                        $(".list").addClass("currentView");
                        $(this).addClass("selected");
                        break;
                    case "tj":
                        if($(".statistics").offset().left < 0 && direction.indexOf("-") == 0){
                            $(".statistics").css("-webkit-transition","left 0s");
                            $(".statistics").css("left","100%");
                        }else if($(".statistics").offset().left > 0 && direction.indexOf("-") == -1){
                            $(".statistics").css("-webkit-transition","left 0s");
                            $(".statistics").css("left","-100%");
                        }
                        setTimeout(function(){
                            $(".statistics").css("-webkit-transition","left 0.8s");
                            $(".statistics").css("left","0px");                       
                        },10);
                        $(".statistics").addClass("currentView");
                        $(this).addClass("selected");
                        break;
                    case "tb":
                        $(".graph").css("left","0px");
                        $(".graph").addClass("currentView");
                        $(this).addClass("selected");
                        break;
                }
            }
        },
        getMore: function(e){
            var that = $(".cat-details",$(this).closest("li"));
            if (that.length != 0){
                that.toggle();
            }else{
                var ul = document.createElement("ul");
                ul.className = "cat-details";
                var category = $(this).closest("p").text().slice(0,2);
                var monthNum = $(this).closest(".cat-stat").closest("li").data("month");
                var details = data.history[monthNum][category];
                for (var i = 1,len = details.length; i < len; i++){
                    var li = document.createElement("li");
                    li.innerHTML = "<li><p><span>" + details[i].timestamp.match(/\/(\d+)$/)[1] + "<b>号</b></span><span>￥" + details[i].value +"</span></p></li>";
                    ul.appendChild(li);
                }
                $(this).closest("li").append(ul);
            }
            var element = e.srcElement ? $(e.srcElement) : $(e.target);
            element.toggleClass("lnr-chevron-down");
            element.toggleClass("lnr-chevron-up");
        },
        switcher: function(){
            $(this).css("background-color","#4D76F5");
            $(this).addClass("actived");
            var sibling = $(this).siblings("span")
            sibling.css("background-color","#A7BAFF");
            sibling.removeClass("actived");
            if(this.id == "month"){
                var now = new Date().getMonth();
                $(this).data("month",now);
                data.getMonthData(now);
                update();
            }else{
                data.loadData();
                loadGraph();
                $(".button i").hide();
                $(".button #month").text("按月")
            }
        },
        selectMonth: function(){
            var now = $(this).siblings(".actived").data("month");
            if ($(this).hasClass("prev")){
                data.getMonthData(now-1);
                $(".button .actived").data("month", now-1);
            }else{
                data.getMonthData(now+1);
                $(".button .actived").data("month", now+1);
            }
            update();
        },
        load: function(){
            loadList();
            data.loadData();
            loadStatistic();
            loadGraph();
        }
     };
    function findData(id){
        list = JSON.parse(localStorage.list);
        for (var i = 0, len = list.length; i < len; i++){
            var item = list[i];
            if(item.id == id){
                return i;
            }
        }
    }
    function deleteData(id){
        var index = findData(id);
        list = list.slice(0,index).concat(list.slice(index+1));
        localStorage.list = JSON.stringify(list);    
    }
    function update(){
        var thisMonth = $(".button .actived").data("month")+1;
        $(".button .actived").text(thisMonth + "月");
        if (thisMonth == data.range.earliest){
            $(".prev").hide();
        }
        else{
            $(".prev").show();
        }
        if(thisMonth == new Date().getMonth() + 1){
            $(".next").hide();
        }
        else{
            $(".next").show();
        }
        loadGraph();
    }
    function loadList(){
        list = JSON.parse(localStorage.list);
        var warnword = document.getElementById("warnword");
        if(warnword){
            warnword.style.display = "none";
        }
        if($(".list").length > 0 && !statusFlag.edit){
            var item = list[list.length - 1];
            var li = document.createElement("li");
            li.className = "details ";
            li.setAttribute("data-id", item.id);
            var html = "<p class='timestamp'>" + item.timestamp + "</p>";
            var cssPair = pairs[item.name];
            html += "<div class='icon'style='background-color:" + cssPair[0]+";'>";
            html += "<i class='the-icons " + cssPair[1] + "'></i></div>";
            html += "<span>" + item.name + "</span>";
            html += "<span class='money'>" + item.value + "</span></li>";
            html += "<div class='edit'><i class='icon-trash'></i><i class='icon-pencil'></i></div>";
            li.innerHTML = html;
            $(".list").prepend(li);
        }else if($(".list").length > 0 && statusFlag.edit){
            $(".details").each(function(index, item){
                list = JSON.parse(localStorage.list);
                var newItem = list[statusFlag.index];
               if(item.dataset.id == newItem.id){
                    var html = "<p class='timestamp'>" + newItem.timestamp + "</p>";
                    var cssPair = pairs[newItem.name];
                    html += "<div class='icon'style='background-color:" + cssPair[0]+";'>";
                    html += "<i class='the-icons " + cssPair[1] + "'></i></div>";
                    html += "<span>" + newItem.name + "</span>";
                    html += "<span class='money'>" + newItem.value + "</span></li>";
                    html += "<div class='edit'><i class='icon-trash'></i><i class='icon-pencil'></i></div>";
                    item.innerHTML = html;
                    $(item).toggleClass("selected");
                    return false;
               }
            });
        }else{
            var fragment = document.createDocumentFragment();
            var ul = document.createElement("ul");
            ul.className = "list currentView";
            ul.style.height = window.innerHeight-parseInt($("header").css("height"))+"px";
            ul.style.overflow = "auto";
            for (var i = list.length-1; i >= 0; i--){
                var item = list[i];
                var li = document.createElement("li");
                li.className = "details";
                li.setAttribute("data-id", item.id);
                var html = "<p class='timestamp'>" + item.timestamp + "</p>";
                var cssPair = pairs[item.name];
                html += "<div class='icon'style='background-color:" + cssPair[0]+";'>";
                html += "<i class='the-icons " + cssPair[1] + "'></i></div>";
                html += "<span>" + item.name + "</span>";
                html += "<span class='money'>" + item.value + "</span></li>";
                html += "<div class='edit'><i class='icon-trash'></i><i class='icon-pencil'></i></div>";
                li.innerHTML = html;
                ul.appendChild(li);
            }
            fragment.appendChild(ul);
            $("header").after(fragment);
        }   
    }
    function loadGraph(){
        $(".graph").css("height", (window.innerHeight-parseInt($("header").css("height"))) + "px");
        $(".graph").css("overflow","auto");
        $(".total .income").html("￥" + data.totalIncome);
        $(".total .outlay").html("￥" + data.totalOutlay);
        $(".total .surplus").html("￥" + (data.totalIncome - data.totalOutlay));
        require.config({
            paths: {
                echarts: 'http://echarts.baidu.com/build/dist'
            }
        });
        require(
            [
                'echarts',
               'echarts/chart/line',// 按需加载所需图表，如需动态类型切换功能，别忘了同时加载相应图表
                'echarts/chart/pie'
            ],
            graphPie
        );
    }
    function graphPie(ec) {
        var myChart1 = ec.init(document.getElementsByClassName('pie')[0]);
        var myChart2 = ec.init(document.getElementsByClassName('line')[0]);
        var option = {
            0:{
                title: {
                    text: "支出占比饼图"
                },
                color: ["#F49539","#f78585","#caba90","#66a2f0","#d05842","#fac803"],
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}\n{c}",
                    backgroundColor: '#e5e5e5',
                    position: function(array){return [array[0],array[1]];}
                },
                legend: {
                    orient : 'vertical',
                    x : 'left',
                    y : "center",
                    data:['衣服','饮食','住宿','购物','交通','其他']
                },
                series : [
                    {
                        name:'占总额的',
                        type:'pie',
                        radius : ['50%', '80%'],
                        itemStyle : {
                            normal : {
                                label : {
                                    show : false
                                },
                                borderColor: "#fff",
                                labelLine : {
                                    show : false
                                }
                            },
                            emphasis : {
                                label : {
                                    show : true,
                                    formatter : '{b}\n{d}%',
                                    position : 'center',
                                    textStyle : {
                                        fontSize : '30',
                                        fontWeight : 'bold'
                                    }
                                }
                            }
                        },
                        data:[                            
                            {value:data.category["衣服"], name:'衣服'},
                            {value:data.category["饮食"], name:'饮食'},
                            {value:data.category["住宿"], name:'住宿'},
                            {value:data.category["购物"], name:'购物'},
                            {value:data.category["交通"], name:'交通'},
                            {value:data.category["其他"], name:'其他'}
                        ]
                    }
                ]
            },
            1: {
                title: {
                    x: "center",
                    text: new Date().getFullYear() + "年每月收入/支出 折线图"
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: '#e5e5e5'
                    // position: function(array){return [array[0],array[1]];}
                },
                legend: {
                    y : 30,
                    data : ["收入","支出"]
                },
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel : {
                            formatter: '￥{value}'
                        }
                    }
                ],
                series : [
                    {
                        name:'收入',
                        type:'line',
                        data: data.month["收入"]
                    },
                    {
                        name:'支出',
                        type:'line',
                        data: data.month["支出"]
                    }
                ]
            }
        };
        myChart1.setOption(option[0]);
        myChart2.setOption(option[1]);
    }
    function loadStatistic(){
        var ul = document.getElementsByClassName("statistics")[0] || document.createElement("ul");
        if (!ul.parentNode){
            ul.className = "statistics";
            ul.style.height = (window.innerHeight-parseInt($("header").css("height")))+"px";
            for (var item in data.history){
                var li = document.createElement("li");
                li.setAttribute("data-month", item);
                var html = "<h1>" + new Date().getFullYear() + "/" + ((item >= 10) ? item : ("0" + item)) +"</h1>";
                html += '<p class="surplus">结余<span style="color:#333">￥' + (data.month["收入"][item-1] - data.month["支出"][item-1]) + '</span></p>';
                html += '<span class="income" style="border-right: 1px solid #eee;">收入<p style="color: #65A878">￥' + data.month["收入"][item-1] + '</p></span>';
                html += '<span class="outlay">支出<p style="color: #a00">￥' + data.month["支出"][item-1] + '</p></span>';
                li.innerHTML = html;
                var ul2 = document.createElement("ul");
                ul2.className = "cat-stat";
                for(var item2 in data.history[item]){
                    var li2 = document.createElement("li");
                    var p = document.createElement("p");
                    p.innerHTML = item2 + "<span>￥" + data.history[item][item2][0] + "  <i class='lnr lnr-chevron-down'></i></span>"; 
                    li2.appendChild(p);
                    ul2.appendChild(li2);
                }
                li.appendChild(ul2);
                ul.insertBefore(li, ul.firstChild);
            }
            $(".graph").before(ul);
        }else{
            var fragment = document.createDocumentFragment();
            ul.innerHTML = "";
            ul.style.height = (window.innerHeight-parseInt($("header").css("height")))+"px";
            for (var item in data.history){
                var li = document.createElement("li");
                li.setAttribute("data-month", item);
                var html = "<h1>" + new Date().getFullYear() + "/" + ((item > 10) ? item : ("0" + item)) +"</h1>";
                html += '<p class="surplus">结余<span style="color:#333">￥' + (data.month["收入"][item-1] - data.month["支出"][item-1]) + '</span></p>';
                html += '<span class="income" style="border-right: 1px solid #eee;">收入<p style="color: #65A878">￥' + data.month["收入"][item-1] + '</p></span>';
                html += '<span class="outlay">支出<p style="color: #a00">￥' + data.month["支出"][item-1] + '</p></span>';
                li.innerHTML = html;
                var ul2 = document.createElement("ul");
                ul2.className = "cat-stat";
                for(var item2 in data.history[item]){
                    var li2 = document.createElement("li");
                    var p = document.createElement("p");
                    p.innerHTML = item2 + "<span>￥" + data.history[item][item2][0] + "  <i class='lnr lnr-chevron-down'></i></span>"; 
                    li2.appendChild(p);
                    ul2.appendChild(li2);
                }
                li.appendChild(ul2);
                fragment.insertBefore(li, ul.firstChild);
            }
            ul.appendChild(fragment);
        }
    }
    function display(index){
        list = JSON.parse(localStorage.list);
        var item = list[index];
        var selectedIcon = $(".selected-category i");
        var selectedBg = $(".selected-category .icon");
        selectedIcon.attr("class", pairs[item.name][1] + " the-icons");
        selectedBg.css("background-color", pairs[item.name][0]);
        selectedBg.next().html(item.name + "<span>￥" + item.value + "</span>");
        calculate.addNum = Number(item.value);
        $("#keyboard").css("height","310px");
    }
}();


var singleton = function(fn) {
    var result;
    return function(){
        if (result) {
            result.style.display = "block";
            result.style.webkitAnimation = null;
            // if (result.style.opacity == 0) {
            //     result.style.opacity = 1;
            // }
        }
        return result || ( result = fn.apply(this, arguments));
    }
};
var createMask = singleton( function(){
    var mask = document.createElement( "div");
    mask.id = "mask";
    return document.body.appendChild(mask);
});
var createConfirm = singleton( function(){
    var confirmWindow = document.createElement("div");
    var html_body = "";
    html_body += '<p style="border-bottom: 1px solid #ccc;">确定删除这条记录么？</p>';
    html_body += '<span id="cancelBtn">取消</span><span id = "comfirmBtn">确认</span>';
    confirmWindow.innerHTML = html_body;
    confirmWindow.id = "comfirm";
    return document.body.appendChild(confirmWindow);
});
var createWarn = singleton( function(string){
    var warnword = document.createElement("p");
    warnword.id = "warnword";
    warnword.innerHTML = string;
    return document.body.appendChild(warnword); 
});