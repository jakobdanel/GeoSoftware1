/**
 * These file holds all javascript functions which important to fill the table with the content of exercise 1.
 * @author Jakob Danel
 * @version 1.0.2
 */

 "use strict"

 /**
  * constant that holds the left upper corner of the polygon as an array with a length of two.
  * Format is [long,lat] in WGS84 
  */
 const leftUpperCorner =  polygon[3];
 
 /**
  * constant that holds the right bottom corner of the polygon as an array with a length of two.
  * Format is [long,lat] in WGS84 
  */
 const rightBottomCorner = polygon[1];
 
 /**
  * Function that validate if a point is inside a rectangle or not. This function works only for rectangles which lines are paralel to the
  * axis from the coordinate System
  * @param {number[]} point A point from the form [long,lat] in WGS84.
  * @param {number[]} leftUpperCornerBBox A point from the form [long,lat] in WGS84. Should be the left upper corner from the bounding box of the rectangle.
  * @param {number[]} rightBottomCornerBBox A point from the form [long,lat] in WGS84. Should be the right bottom corner from the bounding box of the rectangle.
  * @returns true if the point is inside the rectangle, else returns false.
  */
 function isPointInsidePolygon(point, leftUpperCornerBBox = leftUpperCorner, rightBottomCornerBBox = rightBottomCorner){
     return point[0] > leftUpperCornerBBox[0] && point[0] < rightBottomCornerBBox[0] && point[1] < leftUpperCornerBBox[1] && point[1] > rightBottomCornerBBox[1]
 }
 /**
  * 
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @param {number[]} leftUpperCornerBBox A point from the form [long,lat] in WGS84. Should be the left upper corner from the bounding box of the rectangle.
  * @param {number[]} rightBottomCornerBBox A point from the form [long,lat] in WGS84. Should be the right bottom corner from the bounding box of the rectangle.
  * @returns an array of booleans for each point the array contains the value from isPointInsidePolygon(). 
  */
 function arePointsInsidePolygon(points, leftUpperCornerBBox = leftUpperCorner, rightBottomCornerBBox = rightBottomCorner){
     let result = [];
     for (let i = 0; i < points.length; i++) {
         result[i] = isPointInsidePolygon(points[i],leftUpperCornerBBox,rightBottomCornerBBox);
     }
     return result;
 }
 
 /**
  * These algorithm find all the intersection between the route and the rectangle, based on the information if a point is inside or outside
  * from the rectangle. Every time two point which are neighbours are not inside or outside the rectangle both, this could be interpretet as a
  * intersect between these two points and the rectangle. The algorithm returns the indice from the point at which the interect is. 
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @param {number[]} leftUpperCornerBBox A point from the form [long,lat] in WGS84. Should be the left upper corner from the bounding box of the rectangle.
  * @param {number[]} rightBottomCornerBBox A point from the form [long,lat] in WGS84. Should be the right bottom corner from the bounding box of the rectangle.
  * @returns An array of numbers each one is either a indice for the intersect point or the start/end indice from the points array. 
  */
 function findIntersectIndices(points, leftUpperCornerBBox = leftUpperCorner, rightBottomCornerBBox = rightBottomCorner){
     let pointsInsidePolygon = arePointsInsidePolygon(points,leftUpperCornerBBox,rightBottomCornerBBox);
     let result = [];
     for (let i = 0; i < pointsInsidePolygon.length; i++) {
         if(i == 0 || i == pointsInsidePolygon.length - 1){
             result.push(i);
         } 
         else if (!pointsInsidePolygon[i] && (pointsInsidePolygon[i + 1] || pointsInsidePolygon[i - 1])){
             result.push(i);
         }
     }
     return result;    
 }
 
 /**
  * These function takes two geographic points and returns the distance between them. The function uses the Haversine formula for calculation.
  * @param {number[]} p1 A point should be in the form [long,lat] in WGS84. 
  * @param {number[]} p2 A point should be in the form [long,lat] in WGS84.
  * @returns The distance between the two points in meters.
  */
 function distanceInMeter (p1, p2) {
     let R = 6371; // Radius of the earth in km
     var dLat = degree2Radian(p2[1] - p1[1]); 
     var dLon = degree2Radian(p2[0] - p1[0]); 
     var a = 
       Math.sin(dLat/2) * Math.sin(dLat/2) +
       Math.cos(degree2Radian(p1[1])) * Math.cos(degree2Radian(p2[1])) * 
       Math.sin(dLon/2) * Math.sin(dLon/2)
       ; 
     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
     var d = R * c; // Distance in km
     return d * 1000; //In Meters
   }

 /**
  * These function convert an degree value into a radian value.
  * @param {number} degree The degree which should be taken to radian. 
  * @returns The radian value.
  */ 
 function degree2Radian(degree) {
     return degree * (Math.PI/180)
   }
 
 /**
  * Calculates the distance between a number of points by a given array. 
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @returns an array with the distances. At array[n] the distance between points[n] and points[n + 1] is stored.
  */
 function getDistancesBetweenPoints(points){
     let distances = Array(points.length - 1);
     for (let i = 0; i < distances.length; i++) {
         distances[i] = distanceInMeter(points[i], points[i + 1]);
         
     }
     return distances;
 }
 
 /**
  * Calculates the distance from the sections, the sections are calculated by findIntersectIndices().
  * The BoundingBox of the Rectangle are given by the two coordinates.
  *  
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @param {number[]} leftUpperCornerBBox A point from the form [long,lat] in WGS84. Should be the left upper corner from the bounding box of the rectangle.
  * @param {number[]} rightBottomCornerBBox A point from the form [long,lat] in WGS84. Should be the right bottom corner from the bounding box of the rectangle.
  * @returns An array which contains the distance of all sections, starting at index 0 with the first section. 
  */
 function getSectionDistances(points,leftUpperCornerBBox = leftUpperCorner,rightBottomCornerBBox = rightBottomCorner){
     let distances = getDistancesBetweenPoints(points);
     let intersectIndices = findIntersectIndices(points,leftUpperCornerBBox,rightBottomCornerBBox);
     let result = [];
     for (let i = 0; i < intersectIndices.length - 1; i++) {
         var sum = 0;
         for (let j = intersectIndices[i]; j < intersectIndices[i + 1]; j++) {
             sum += distances[j];
         }        
         result.push(sum);
     }
     return result;
 } 
 
 /**
  * These function calculates the full distance between a given array of points.
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @returns the complete distance between the points in metern.
  */
 function calculateFullDistance(points){
     let distances = getDistancesBetweenPoints(points);
     let sum = 0;
     for (let i = 0; i < distances.length; i++) {
         sum += distances[i];
     }
     return sum;
 }
 /**
  * These functions collecting all data which are needed for the HTML document. These are a section number, the length of the section their starting and
  * end point and the information if the section is inside the polygon or not. The data will be sorted after the length of the sections.
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @param {number[]} leftUpperCornerBBox A point from the form [long,lat] in WGS84. Should be the left upper corner from the bounding box of the rectangle.
  * @param {number[]} rightBottomCornerBBox A point from the form [long,lat] in WGS84. Should be the right bottom corner from the bounding box of the rectangle.
  * @returns a 2 dimensional array with the raw data for the HTML document. 
  */
 function getTableData(points, leftUpperCornerBBox = leftUpperCorner, rightBottomCornerBBox = rightBottomCorner){
     let tableData = [];
     let distances = getSectionDistances(points, leftUpperCornerBBox, rightBottomCornerBBox);
     let intersectIndices = findIntersectIndices(points, leftUpperCornerBBox, rightBottomCornerBBox);
     let insideRectangle = arePointsInsidePolygon(points, leftUpperCornerBBox, rightBottomCornerBBox);
     for (let index = 0; index < distances.length; index++) {
         var tableRow = Array(5);
         tableRow[0] = index + 1;
         tableRow[1] = distances[index];
         tableRow[2] = points[intersectIndices[index]];
         tableRow[3] = points[intersectIndices[index + 1]];
         tableRow[4] = insideRectangle[intersectIndices[index] + 1];
         
         tableData.push(tableRow);
     }
     tableData.sort((a, b) => b[1] - a[1]);
     return tableData;
 }
 /**
  * Converting the table data in a more readalike form.
  * @param {number[][]} points An array of points. A point should be in the form [long,lat] in WGS84.
  * @param {number[]} leftUpperCornerBBox A point from the form [long,lat] in WGS84. Should be the left upper corner from the bounding box of the rectangle.
  * @param {number[]} rightBottomCornerBBox A point from the form [long,lat] in WGS84. Should be the right bottom corner from the bounding box of the rectangle.
  * @returns The data from getTableData in a more readable form
  */
 function convertTableValues(points, leftUpperCornerBBox = leftUpperCorner, rightBottomCornerBBox = rightBottomCorner){
     let rawData = getTableData(points, leftUpperCornerBBox, rightBottomCornerBBox);
     let tableContent = rawData;
     for (let i = 0; i < rawData.length; i++) {
         tableContent[i][1] = round(rawData[i][1],2);
         tableContent[i][2] = "(" + rawData[i][2] +")"; 
         tableContent[i][3] = "(" + rawData[i][3] +")"; 
         if(rawData[i][4]){
             tableContent[i][4] = "YES";
         } else {
             tableContent[i][4] = "NO"
         }
     }
     return tableContent;
 }
 /**
  * Rounds a value by a given precision
  * @param {number} x number which should be rounded.
  * @param {number} n how many values should be after the comma.
  * @returns the rounded value.
  */
 function round(x,n){
   return Math.round(x * 10**n)/10**n;
}