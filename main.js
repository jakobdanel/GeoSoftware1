/**
 * These file extends the table in the HTML document with the information gained in tanleContent.js
 * @author Jakob Danel 
 * @version 1.0.2
 */


/**
 * These functions generate HTML-Code for the table body. The result can be written in the tbody tag from the HTML page. Its filled
 * with the content of tableData
 * @param {any[][]} tableData a two dimensional array which contain the elements, which should be shown at the HTML table
 * @returns a String with HTML Code with the content from tableData
 */
function makeTableHTML(tableData) {
    var result = "<table border=1>";
    for(var i = 0; i < tableData.length; i++) {
        result += "<tr>";
        for(var j = 0; j < tableData[i].length; j++){
            result += "<td>"+tableData[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}

//filling the tablebody with the data
document.getElementById("tbody").innerHTML = makeTableHTML(convertTableValues(route));

//adding the sum of distances to the HTML-Page.
document.getElementById("totalLength").innerHTML = "Total length in meter: "+ round(calculateFullDistance(route),2)+"m";
