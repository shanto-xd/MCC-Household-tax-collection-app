exports.dateFormatter = (dt) => {
    var mm = dt.getMonth() + 1;
    var dd = dt.getDate();
    var yyyy = dt.getFullYear();
    return dd + '/' + mm + '/' + yyyy
}