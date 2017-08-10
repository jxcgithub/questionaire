<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String id = (String)session.getAttribute("id");	
%>
<!DOCTYPE html> 
<html>
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1"> 
        <title>问卷调查</title>
        <link rel="stylesheet" href="jquery.mobile-1.3.2.min.css" />
        <script src="jquery-1.9.1.min.js"></script>
        <script src="jquery.mobile-1.3.2.min.js"></script>
    </head> 
    
    <body> 
        
        <div data-role="page">
            <div data-role="content">
				<a href="ess/quiz.html?id=<%=id%>" data-role="button" data-icon="arrow-r" data-iconpos="right">ESS嗜睡量表</a>
				<a href="sds/quiz.html?id=<%=id%>" data-role="button" data-icon="arrow-r" data-iconpos="right">SDS抑郁自测量表</a>
				<a href="psqi/quiz.html?id=<%=id%>" data-role="button" data-icon="arrow-r" data-iconpos="right">PSQI睡眠质量指数量表</a>
            </div>
            
        </div>

		<script src="ess/app.js"></script>
		<script src="ess/quiz.js"></script> 
		<script src="sds/app.js"></script>
		<script src="sds/quiz.js"></script> 
		<script src="psqi/app.js"></script>
		<script src="psqi/quiz.js"></script> 
	</body>
</html>