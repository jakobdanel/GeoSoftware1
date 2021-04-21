"use strict"
//constant to define ...
const leftUpperCorner =  polygon[3];
const rightBottomCorner = polygon[1];

var resultArray = new Array(route.length);
let intersectIndex = [];
var distanceFromPoint2Point = new Array(route.length - 1);
var distancesSubSequences = [];
var tableContent = [];

// Function to find out whether a point is in a polygon or not.
// Works only with polygons which are parellel to the longitude and latitude-axis 
// Input: point [long,lat], leftUpperCorner (of the polygon) [long,lat], rightBottomCorner [long, lat] (of the polygon)
// returns true if the point is inside the polygon, else not.
function isPointInsidePolygon(point, leftUpperCornerBBox, rightBottomCornerBBox){
    return point[0] > leftUpperCornerBBox[0] && point[0] < rightBottomCornerBBox[0] && point[1] < leftUpperCornerBBox[1] && point[1] > rightBottomCornerBBox[1]
}

function fillResultArray(){
    for (let index = 0; index < route.length; index++) {
        resultArray[index] = isPointInsidePolygon(route[index],leftUpperCorner,rightBottomCorner);    
    }
}

function fillIntersectIndex(){
    for (let index = 0; index < resultArray.length; index++) {
        if(index == 0 || index == resultArray.length - 1){
            intersectIndex.push(index);
        } 
        else if (!resultArray[index] && (resultArray[index+1] || resultArray[index-1])) {
                intersectIndex.push(index);
            } 
        }      

}
function distanceInMeter (p1, p2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(p2[1] - p1[1]);  // deg2rad below
    var dLon = deg2rad(p2[0] - p1[0]); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(p1[1])) * Math.cos(deg2rad(p2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d * 1000; //In Meters
  }
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

function calculateDistances(){
    for (let index = 0; index < distanceFromPoint2Point.length; index++) {
        distanceFromPoint2Point[index] = distanceInMeter(route[index],route[index + 1]);
    }
}

function calculateDistancesSubSequences(){
    for (let index = 0; index < intersectIndex.length - 1; index++) {
        var sum = 0
        for (let i = intersectIndex[index]; i < intersectIndex[index + 1]; i++) {
            sum += distanceFromPoint2Point[i];
        }
        distancesSubSequences.push(sum);
        
    }
}

function calculateFullDistance(){
    var sum = 0;
    for (let i = 0; i < distanceFromPoint2Point.length; i++) {
        sum += distanceFromPoint2Point[i];
    }
    return sum;
}

function calculateFullDistance2(){
    var sum = 0;
    for (let i = 0; i < distancesSubSequences.length; i++) {
        sum += distancesSubSequences[i];
    }
    return sum;
}

function fillContentTable(){
    for (let index = 0; index < distancesSubSequences.length; index++) {
        var tableRow = Array(3);
        tableRow[0] = index + 1;
        tableRow[1] = distancesSubSequences[index];
        tableRow[2] = route[intersectIndex[index]];
        tableRow[3] = route[intersectIndex[index + 1]];
        tableRow[4] = resultArray[intersectIndex[index] + 1];
        
        tableContent.push(tableRow);
    }

}
function convertTableValues(){
    for (let index = 0; index < tableContent.length; index++) {
        tableContent[index][1] = round(tableContent[index][1],2);
        tableContent[index][2] = "(" + tableContent[index][2] +")"; 
        tableContent[index][3] = "(" + tableContent[index][3] +")"; 
        if(tableContent[index][4]){
            tableContent[index][4] = "YES";
        } else {
            tableContent[index][4] = "NO"
        }
    }
}
function makeTableHTML(myArray) {
    var result = "<table border=1>";
    for(var i=0; i<myArray.length; i++) {
        result += "<tr>";
        for(var j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
function round(x,n){
    var tmp = x*Math.pow(10,n);
    var tmp2 =  Math.round(tmp);
    return tmp2 / Math.pow(10,n);
}
fillResultArray();
fillIntersectIndex();
calculateDistances();
calculateDistancesSubSequences();
fillContentTable();

tableContent.sort((a,b) => b[1] - a[1]);
convertTableValues();
document.getElementById("tbody").innerHTML = makeTableHTML(tableContent);
document.getElementById("totalLength").innerHTML = "Total Length in meter: "+ round(calculateFullDistance(),2)+"m";

console.log(round(23.1234546326281,2));
/*
console.table(resultArray);
console.table(intersectIndex);
console.table(distanceFromPoint2Point);
console.table(distancesSubSequences);

console.table(distancesSubSequences);

console.log(calculateFullDistance());
console.log(calculateFullDistance2());

console.table(tableContent);

console.log(intersectIndex.toString());
*/