/* global $,window */
var psqiQuizMaster = (function () {
	var name;
	var data;
	var loaded = false;
	var displayDom;
	var successCbAlias;
	
	var locString;
	var id;
	var score;
	
	var numArr = [];
	
	function restartHandler(e) {
		e.preventDefault();

		var status = getUserStatus();
		
		status.question = 0;
		status.answers = [];
		
		numArr = [];
		
		storeUserStatus(status);
		displayQuiz(status);
	}
	
	function preHandler(e) {
		e.preventDefault();

		var status = getUserStatus();
		
		if(status.question > 0){
			status.question--;
		}

		storeUserStatus(status);
		displayQuiz(status);
	}

	function nextHandler(e) {
		e.preventDefault();

		var status = getUserStatus();

		//if we aren't on the intro, then we need to ensure you picked something
		if(status.question >= 0) {
			if(status.question == 0 || status.question == 2){
				var num = $("#number-"+status.question).val(); 
				if(num != ""){
					numArr[status.question] = num;
				}else{
					window.alert("请填写问题答案!");
					return;
				}
			}else if(status.question == 3){
				var num = parseInt($("#number-"+status.question).val()); 
				if(num){
					if(num>0){
						numArr[status.question] = num;
					}else{
						window.alert("答案不能是负数!");
						return;
					}
				}else{
					window.alert("请填写问题答案!");
					return;
				}
			}else{
				var checked = $("input[type=radio]:checked", displayDom);
				if(checked.length === 0) {
					//for now, an ugly alert
					window.alert("请选择其中一项!");
					return;
				} else {
					status.answers[status.question] = checked.val();	
				}
			}
		} 
		status.question++;
		storeUserStatus(status);
		displayQuiz(status);
	}
	
	function submitHandler(e) {
		e.preventDefault();
		removeUserStatus();
		
		$.ajax({
            type: "POST",
            url: "/bms/questionaire/saveQuizResult.do",
            data: {"id":id,"score":score,"type":"PSQI"},
            dataType: "json",
            success: function(data){
            	if(data.code == 200){
            		window.alert("提交成功");
            	}else{
            		window.alert("提交失败");
            	}
            	
            }
        });
	}

	function displayQuiz(status) {

		//We copy this out so our event can use it later. This feels wrong
		//successCbAlias = successCb;
		var current = getQuiz();
		var html;
		
		if(!status){
			status = getUserStatus();
		}

		if(current.state === "introduction") {
			html = /*"<h2>说明</h2><p>" +*/ current.introduction + /*"</p>" +*/ actionButton();
			displayDom.html(html).trigger('create');
			
			$("#header").hide();
		} else if(current.state === "inprogress") {
			$("#header").show();
			
			html = "<h2>" + current.question.question + "</h2>";
			if(status.question == 0 || status.question == 2){
				var num = numArr[status.question];
				html += "<form><input type='time' data-clear-btn='true' id='number-"+status.question
				if(num != ""){
					html += "' value='"+num+"'></form>";
				}else{
					html += "' value=''></form>";
				}
			}else if(status.question == 3){
				var num = numArr[status.question];
				html += "<form><input type='number' data-clear-btn='true' pattern='[1-24]' id='number-"+status.question
				if(num){
					html += "' value='"+num+"'></form>";
				}else{
					html += "' value=''></form>";
				}
			}
			else{
				html += "<form><div data-role='fieldcontain'><fieldset data-role='controlgroup'>";
				for(var i=0; i<current.question.answers.length; i++) {
					html += "<input type='radio' name='quizMasterAnswer' id='quizMasterAnswer_"+i+"' value='"+current.question.scores[i]+"'";
					
					if(status.answers && status.answers[status.question] && status.answers[status.question] == current.question.scores[i]){
						html += " checked='true' ";
					}
					
					html += "/><label for='quizMasterAnswer_"+i+"'>" + current.question.answers[i] + "</label>";
				}
				html += "</fieldset></div></form>" ; 
			}
			html += "<div class='ui-grid-a'>" ; 
			
			if(status.question > 0){
				html += preButton();
			}
			html += nextButton() + "</div>";
			displayDom.html(html).trigger('create');
		} else if(current.state === "complete") {
            html = "<h2>完成!</h2><p>得分： "+current.score+"</p>" + submitButton();
			displayDom.html(html).trigger('create');
			
			//successCb(current);
			$("#restartQuiz").show();
		}
		
		
		//Remove previous if there...
		//Note - used click since folks will be demoing in the browser, use touchend instead
		displayDom.off("click", ".quizMasterNext", nextHandler);
		//Then restore it
		displayDom.on("click", ".quizMasterNext", nextHandler);
		
		//Remove previous if there...
		//Note - used click since folks will be demoing in the browser, use touchend instead
		displayDom.off("click", ".quizMasterPre", preHandler);
		//Then restore it
		displayDom.on("click", ".quizMasterPre", preHandler);
		
		displayDom.off("click", ".submitQuiz", submitHandler);
		//Then restore it
		displayDom.on("click", ".submitQuiz", submitHandler);
	}
	
	function getKey() {
		return "psqi_quiz_"+name;	
	}
	
	function getQuestion(x) {
		return data.questions[x];	
	}
	
	function getQuiz() {
		//Were we taking the quiz already?
		var status = getUserStatus();
		if(!status) {
			status = {question:-1,answers:[]};
			storeUserStatus(status);
		}
		//If a quiz doesn't have an intro, just go right to the question
		if(status.question === -1 && !data.introduction) {
			status.question = 0;
			storeUserStatus(status);
		}

		var result = {
			currentQuestionNumber:status.question
		};
		
		if(status.question == -1) {
			result.state = "introduction";
			result.introduction = data.introduction;	
		} else if(status.question < data.questions.length) {
			result.state = "inprogress";
			result.question = getQuestion(status.question);	
		} else {
			result.state = "complete";
			result.score = parseInt(status.answers[14]) + parseInt(status.answers[15]);
			
			var tmp = parseInt(status.answers[1]) + parseInt(status.answers[4]);
			if(tmp < 3 && tmp > 0){
				result.score += 1;
			}else if(tmp < 5){
				result.score += 2;
			}else{
				result.score += 3;
			}
			
			if(numArr[3] >= 6 && numArr[3] < 7) {
				result.score += 1;
			}else if(numArr[3] >= 5 && numArr[3] < 6) {
				result.score += 2;
			}else if(numArr[3] < 5) {
				result.score += 3;
			}
			
			var start = numArr[0].split(":");
			num1 = parseInt(start[0]) + parseFloat(parseInt(start[1])*1.0/60);
			
			var end = numArr[2].split(":");
			num2 = parseInt(end[0]) + parseFloat(parseInt(end[1])*1.0/60);
			
			var num3 = num2 - num1;
			if(num3 < 0){
				num3 += 24;
			}
			
			tmp = numArr[3] * 1.0 / (num3);
			if(tmp < 0.65){
				result.score += 3;
			}else if(tmp < 0.75){
				result.score += 2;
			}else if(tmp < 0.85){
				result.score += 1;
			}
			
			tmp = 0;
			for(var i=5; i < 14; i++) {
				tmp = tmp + parseInt(status.answers[i]);
			}
			if(tmp < 10 && tmp > 0){
				result.score += 1;
			}else if(tmp < 19){
				result.score += 2;
			}else if(tmp < 28){
				result.score += 3;
			}
			
			tmp = parseInt(status.answers[16]) + parseInt(status.answers[17]);
			if(tmp < 3 && tmp > 0){
				result.score += 1;
			}else if(tmp < 5){
				result.score += 2;
			}else{
				result.score += 3;
			}
			
			score = result.score;
		}
		return result;
	}
	
	function getUserStatus() {
		var existing = window.sessionStorage.getItem(getKey());
		if(existing) {
			return JSON.parse(existing);
		} else {
			return null;
		}
	}
	
	function actionButton() {
		return "<a href='' class='quizMasterNext' data-role='button'>开始</a>";	
	}
	
	function preButton() {
		return "<div class='ui-block-a'><a href='' class='quizMasterPre' data-role='button' data-icon='arrow-l' data-iconpos='left'>上一个</a></div>";	
	}
	
	function nextButton() {
		return "<div class='ui-block-b'><a href='' class='quizMasterNext' data-role='button' data-icon='arrow-r' data-iconpos='right'>下一个</a></div>";	
	}
	
	function submitButton() {
		return "<a href='' class='submitQuiz' data-role='button'>提交</a>";	
	}
	
	function removeUserStatus(s) {
		window.sessionStorage.removeItem(getKey());	
	}
	
	function storeUserStatus(s) {
		window.sessionStorage.setItem(getKey(), JSON.stringify(s));
	}
	
	function getQueryString(str){
		var rs = new RegExp("(^|)"+str+"=([^&]*)(&|$)","gi").exec(locString),tmp;
		if(tmp = rs)
			return tmp[2];
		return null;
	}
	
	return {
		execute: function( url, dom, cb ) {
			//We cache the ajax load so we can do it only once 
			displayDom = $(dom);
			
			locString = String(window.document.location.href);
			id = getQueryString("id");
			
			$("#quizListPanel").html("<a href='../ess/quiz.html?id="+id+"' data-role='button' data-icon='arrow-r' data-mini='true' data-iconpos='right' data-inline='true'>ESS嗜睡量表</a>"
					+ "<a href='../sds/quiz.html?id="+id+"' data-role='button' data-icon='arrow-r' data-mini='true' data-iconpos='right' data-inline='true'>SDS抑郁自测量表</a>"
					+ "<a href='../psqi/quiz.html?id="+id+"' data-role='button' data-icon='arrow-r' data-mini='true' data-iconpos='right' data-inline='true'>PSQI睡眠质量指数量表</a>").trigger('create');
			
			$("#restartQuiz").click(restartHandler);
			
			if(!loaded) {
				
				$.get(url, function(res, code) {
					//Possibly do validation here to ensure basic stuff is present
					name = url;
					data = res;			
					//console.dir(res);
					loaded = true;
					displayQuiz(null);

				});
				
			} else {
				displayQuiz(null);
			}
		}
	};
}());