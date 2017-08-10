/* global $,document,console,quizMaster */
$(document).ready(function() {
	
	$(document).on("pageshow", "#psqiQuizPage", function() {
		console.log("Page show");
		//initialize the quiz
		psqiQuizMaster.execute("/bms/questionaire/psqi/questionaire.json", ".quizdisplay", function(result) {
			console.log("SUCESS CB");
			console.dir(result);	
		});
	});

});