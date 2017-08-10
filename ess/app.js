/* global $,document,console,quizMaster */
$(document).ready(function() {
	
	$(document).on("pageshow", "#essQuizPage", function() {
		console.log("Page show");
		//initialize the quiz
		essQuizMaster.execute("/bms/questionaire/ess/questionaire.json", ".quizdisplay", function(result) {
			console.log("SUCESS CB");
			console.dir(result);	
		});
	});

});