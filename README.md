# quick-compare
Node module for doing quick file system compares.
This is a really simplistic model that returns back a JSON object of the differences between files.

## Reference

### fileCompare

The method fileCompare just compares two files specified as strings and returns a callback with a JSON object that contains each files stat information in a object called stats, as well as three other properties.  fullPath; exists; size_diff; modified_diff.
fullPath is the path to the file that the current object in array is comparing.
The method exists returns true if the file exists or false if the file can not be found.
size_diff is the difference in bytes from the compared other file in array.
modified_diff is the difference in miliseconds from the other file in array.

```
var qc = require('quick-compare');

qc.fileCompare('dir1/file.txt', 'dir2/file.txt', function(ret_obj) {
  if (ret_obj[0].exists && ret_obj[1].exists) {
    if (ret_obj[0].size_diff > ret_obj[1].size_dif) {
      console.log("First file is bigger than the second.");
    } else {
      console.log("Second file is bigger than the first.");
    }
    
    if (ret_obj[0].modified_diff > ret_obj[1].modified_diff) {
      console.log("First file has been modified more recent than the second one.");
    } else {
      console.log("Second file has been modified more recent than the first one.");
    }
  }
});

```


### directoryCompare

directoryCompare recursively scales the first directory path specified and tries to find a match in the second path.  For every file it finds it returns in callback a compare array object exactly like fileCompare for that file it found.  This happens asynchronously so no real path pattern can be gauranteed.  In fact you should not be using this method with any intention of a pattern.  Use the fullPath property to base any kind of logics necessary.

```
var qc = require('quick-compare');

qc.directoryCompare("dir1", "dir2", function(ret_obj) {
  if (ret_obj[0].exists && ret_obj[1].exists) {
    if (ret_obj[0].size_diff > ret_obj[1].size_dif) {
      console.log("First file is bigger than the second.");
    } else {
      console.log("Second file is bigger than the first.");
    }
    
    if (ret_obj[0].modified_diff > ret_obj[1].modified_diff) {
      console.log("First file has been modified more recent than the second one.");
    } else {
      console.log("Second file has been modified more recent than the first one.");
    }
  }
});
```
