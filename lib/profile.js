//Parse todoist object.
exports.parse = function(json){

  if('string' == typeof json) json = JSON.parse(json);

  var todoist = {};
  todoist.full_name = json.user.full_name;
  todoist.email = json.user.email;
  todoist.id = json.user.id;
  todoist.inbox_project = json.user.inbox_project;
  todoist.access_token = json.user.token;
  todoist.sync_token = json.sync_token;
  return todoist;
}