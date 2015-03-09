'use strict';
/**
 * File comparing
 * Shawn Rapp - 2015-02-18
 */

var fs = require('fs');
 

function fixCompareObject(stat_obj) {
    if (typeof stat_obj.mtime === "string") {
        stat_obj.atime = new Date(stat_obj.atime);
    }
    if (typeof stat_obj.mtime === "string") {
        stat_obj.ctime = new Date(stat_obj.ctime);
    }
    if (typeof stat_obj.mtime === "string") {
        stat_obj.mtime = new Date(stat_obj.mtime);
    }
    
    return stat_obj;
}

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


/**
 * fileCompare(file1, file2, callback)
 * returns all the differences between two files
 */
module.exports.fileCompare = function(file1, file2, callback) {
    var ret_obj = [{fullPath:file1, exists:false}, {fullPath:file2, exists:false}];

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
                callback(ret_obj);
            }
        });
    });
};


/**
 * directoryCompare(directory1, directory2)
 * returns all the differences between two directories returning the difference
 * of each file it finds.
 */
module.exports.directoryCompare = function(directory1, directory2, cb_Results){
    //var new_compare_object = [];
    var path = require("path");
    fs.readdir(directory1, function(err,files){
        if (!err) {
            var async = require("async");

            async.each(files, function(cur_file_name, callback){
                var dir1_file = path.join(directory1, cur_file_name);

                fs.stat(dir1_file, function(err, stats){
                    if (!err) {
                        var dir2_file = path.join(directory2, cur_file_name);
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
};

/**
 * compareHashFile(file_to_compare, cb_Matches)
 */
module.exports.compareStatFile = function(compare_file, cb_Matches){
    var path = require("path");
    var file_path = path.dirname(compare_file);
    var file_name = path.basename(compare_file);
    
    var stats_path = path.join("stats", file_path);
    var stats_name = path.join(stats_path, file_name+".stat");

    var ret_obj = [{fullPath:compare_file, exists:false}, {fullPath:stats_name, exists:false}];

    fs.open(compare_file, "r", function(err, fd){
        if (!err) {
            fs.stat(compare_file, function(err, stats){
                if (!err) {
                    ret_obj[0].exists = true;
                    ret_obj[0].stats = stats;
                    fs.readFile(stats_name, function(err, data){
                        var stat_obj = {};
                        try {
                            if (typeof data !== 'undefined')
                                stat_obj = fixCompareObject(JSON.parse(data));
                        } catch(err) {
                            console.log(err);
                            console.log(data);
                        }
                        
                        if (err) {
                            cb_Matches(ret_obj);
                        } else {
                            ret_obj[1].exists = true;
                            ret_obj[1].stats = stat_obj;
                            cb_Matches(tagDifferences(ret_obj));
                       }
                    });
                } else {
                    cb_Matches(tagDifferences(ret_obj));
                }
            });
        } else {
            cb_Matches(ret_obj);
        }
    });
};


/**
 * writeStatFile(compare_file)
 */
module.exports.writeStatFile = function(compare_file) {
    fs.exists(compare_file, function(exists){
        if (!exists) return; 
    });
    var path = require("path");
    var mkdirp = require("mkdirp");
    
    var file_path = path.dirname(compare_file);
    var file_name = path.basename(compare_file);
    
    var hash_path = path.join("stats", file_path);
    var hash_file = path.join(hash_path, file_name+".stat");
    fs.stat(compare_file, function(err_stat, stats){
        mkdirp(hash_path, function(err_hash_path){
            if (!err_stat && !err_hash_path) fs.writeFile(hash_file, JSON.stringify(stats), function(err_write){
                if (err_write) {
                    //error happened.
                }
            });
        });
    });
};


/**
 * 
 */
module.exports.compareStatDirectory = function(compare_directory, cb_Result) {
    var path = require("path");
    fs.readdir(compare_directory, function(err, files){
        if (!err) {
            var async = require("async");
            async.each(files, function(cur_file_name, callback){
                var dir1_file = path.join(compare_directory, cur_file_name);

                fs.stat(dir1_file, function(err, stats){
                    if (!err) {
                        if (stats.isDirectory()) {
                            exports.compareStatDirectory(dir1_file, cb_Result);
                        } else if (stats.isFile()) {
                            exports.compareStatFile(dir1_file, function(compare_object){
                                cb_Result(compare_object); 
                            });
                        }
                    }
                });
            });
        } else {
            //error happened
        }
    });
};
