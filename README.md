# quick-compare
Node module for doing quick file system compares.
This is a really simplistic model that returns back a JSON object of the differences between files.

## Reference

### fileCompare
'''
var qc = require('quick-compare');

qc.fileCompare('dir1/file.txt', 'dir2/file.txt', function(ret_obj) {
  if (ret_obj[0].exists && ret_obj[1].exists) {
    if (ret_obj[0].size_diff > ret_obj[1].size_dif) {
      console.log("First file is bigger than the second.");
    } else {
      console.log("Second file is bigger than the first.");
    }
  }
});

'''
