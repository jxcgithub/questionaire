/* global $,document,console,quizMaster */
$(document).ready(function() {
	
	$(document).on("pageshow", "#sdsQuizPage", function() {
		console.log("Page show");
		//initialize the quiz
		sdsQuizMaster.execute("/bms/questionaire/sds/questionaire.json", ".quizdisplay", function(result) {
			console.log("SUCESS CB");
			console.dir(result);	
		});
	});

});