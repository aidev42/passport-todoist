//Parse todoist object.
exports.parse = function(json){

  if('string' == typeof json) json = JSON.parse(json);

  var todoist = {};

  todoist.id = json.data.user.id;
  todoist.email = json.data.user.email;
  todoist.full_name = json.data.user.full_name;
  todoist.inbox_project = json.data.user.inbox_project;
  todoist.business_account_id = json.data.user.business_account_id;
  todoist.displayName = json.data.user.display_name;

  return todoist;
}