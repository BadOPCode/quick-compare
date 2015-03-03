'use strict';
/**
 * File comparing
 * Shawn Rapp - 2015-02-18
 */
 
 var shell = require("shelljs");

/**
 * returns all the differences between two files
 * fileCompare(file1, file2, callback)
 */
module.exports.fileCompare = function(file1, file2, callback) {
    var fs = require('fs');
    var ret_obj = [{fullPath:file1, exists:false}, {fullPath:file2, exists:false}];

    function tagDifferences(ret_obj) {
        var path = require("path");

        if (ret_obj[0].exists) {
            ret_obj[0].file_name = path.basename(ret_obj[0].fullPath);
        }
        if (ret_obj[1].exists) {
            ret_obj[1].file_name = path.basename(ret_obj[1].fullPath);
        }
        
        if (ret_obj[0].file_name === ret_obj[1].file_name) {
            ret_obj[0].match_file_name = true;
            ret_obj[1].match_file_name = true;
        } else {
            ret_obj[0].match_file_name = false;
            ret_obj[1].match_file_name = false;
        }
        
        if (ret_obj[0].exists && ret_obj[1].exists) {
            ret_obj[0].size_diff = ret_obj[0].stats.size - ret_obj[1].stats.size;
            ret_obj[1].size_diff = ret_obj[1].stats.size - ret_obj[0].stats.size;
            ret_obj[0].modified_diff = ret_obj[0].stats.mtime.getTime() - ret_obj[1].stats.mtime.getTime();
            ret_obj[1].modified_diff = ret_obj[1].stats.mtime.getTime() - ret_obj[0].stats.mtime.getTime();
        }
        
        return ret_obj;
    }

    fs.open(file1, "r", function(err,fd){
        if (!err) {
            ret_obj[0].exists = true;
            fs.stat(file1, function(err, stats){
                if (!err) {
                    ret_obj[0].stats = stats;
                }
            });
        }
        fs.open(file2, "r", function(err,fd){
            if (!err) {
                ret_obj[1].exists = true;
                fs.stat(file2, function(err, stats){
                    if (!err) {
                        ret_obj[1].stats = stats;
                    }
                    
                    callback(tagDifferences(ret_obj));
                });
            } else {
                ret_obj = tagDifferences(ret_obj);
                //console.log(ret_obj);
                callback(ret_obj);
            }
        });
    });
};

//directoryCompare(directory1, directory2)
module.exports.directoryCompare = function(directory1, directory2, cb_Results){
    var fs = require("fs");
    //var new_compare_object = [];
    fs.readdir(directory1, function(err,files){
        if (!err) {
            var async = require("async");
            
            async.each(files, function(cur_file_name, callback){
                var dir1_file = directory1+"/"+cur_file_name;

                fs.stat(dir1_file, function(err, stats){
                    if (!err) {
                        var dir2_file = directory2+"/"+cur_file_name;
                        if (stats.isDirectory()) {
                            exports.directoryCompare(dir1_file, dir2_file, cb_Results);
                        } else if (stats.isFile()) {
                            exports.fileCompare(dir1_file, dir2_file, function(compare_object){
                                cb_Results(compare_object); 
                            });
                        }
                    }
                });
            });
        } else { // most likely the directory doesn't exist
        }
    });
} ;