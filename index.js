const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

class Database {
    createdatabase(databaseName){
        const paths = path.join(__dirname,databaseName)
        const path2 = path.join(databaseName,'auth')

        if (fs.existsSync(path)){
            throw new Error('database  already exists')
        }else{
            fs.mkdirSync(paths)
            fs.mkdirSync(path2)
            console.log('database successfully created');
        }
    }
    createAuthModel(databaseName,Authname){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        if (fs.existsSync(rootpath)) {
            throw new Error('auth already exists')
        }else{
            fs.writeFileSync(rootpath,JSON.stringify([]))
        }
    }
    signAuth(databaseName,Authname,signdata,encrypt,allowDuplicate = false){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        const read = JSON.parse(fs.readFileSync(rootpath))

        if (signdata.hasOwnProperty('password') && encrypt === true){
            const hash = crypto.createHmac('sha256','salt').update(signdata.password).digest('hex')
              signdata.password = hash
        }

        const exists = read.some(obj =>obj.email === signdata.email && obj.password === signdata.password)

        if(!exists || allowDuplicate){
            read.push(signdata)
            fs.writeFileSync(rootpath,JSON.stringify(read))
        }   
    }
    Authenticate(databaseName,Authname,signdata){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        const read = JSON.parse(fs.readFileSync(rootpath))

        if (signdata.hasOwnProperty('password')){
            const hash = crypto.createHmac('sha256','salt').update(signdata.password).digest('hex')
              signdata.password = hash
        }

        const filters = read.filter(data=>data.email === signdata.email && data.password === signdata.password)
        if (filters.length === 0) {
            throw new Error('Authentication failed')
        }else{
            return filters
        }

    }
    updatesign(databaseName,Authname,filters,updatedata,encrypt){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        const read = JSON.parse(fs.readFileSync(rootpath))

        if (updatedata.hasOwnProperty('password') && encrypt === true){
            const hash = crypto.createHmac('sha256','salt').update(updatedata.password).digest('hex')
              updatedata.password = hash
        }

        read.forEach(row => {
            if (filters(row)) {
                Object.keys(updatedata).forEach(key=>{
                    row[key] = updatedata[key]
                })
            }
        });
        fs.writeFileSync(rootpath,JSON.stringify(read))

    }
    deletesign(databaseName,Authname,filters){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        let read = JSON.parse(fs.readFileSync(rootpath))
        const deletes = read.filter(row=> !filters(row))
        read = deletes
        fs.writeFileSync(rootpath,JSON.stringify(read))
    }
    displayAuths(databaseName,Authname,filters){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        let read = JSON.parse(fs.readFileSync(rootpath))
        const queries = read.filter(filters)
        return queries
    }
    searchAuth(databaseName,Authname,searchElement){
        const rootpath =`${databaseName}/auth/${Authname}.json`
        let read = JSON.parse(fs.readFileSync(rootpath))
        const results = read.filter(obj=>{
            const values = Object.values(obj)
            for (let i = 0; i < values.length; i++) {
                if ((typeof values[i]=== "string"||typeof values[i]=== "number")&& String(values[i]).includes(searchElement)){
                    return true
                }
            }
            return false
        })
        return results
    }

    // End of auth

    createcluster(databaseName,clustername){
        const clusterpath = path.join(databaseName,`${clustername}.json`)
        if (fs.existsSync(clusterpath)) {
            throw new Error('cluster already exists')
        }
        fs.writeFileSync(clusterpath,JSON.stringify([]))
    }
    insert(databaseName,clustername,data,allowDuplicate = false){
        const clusterpath = path.join(databaseName,`${clustername}.json`)
        if (!fs.existsSync(clusterpath)) {
            throw new Error('cluster does not exists')
        }
        const read = JSON.parse(fs.readFileSync(clusterpath))
        const isduplicate = read.some(item =>{
            return JSON.stringify(item) === JSON.stringify(data)
        })
        if (!isduplicate|| allowDuplicate) {
            read.push(data)
            fs.writeFileSync(clusterpath,JSON.stringify(read))
        }
    }
    Query(databaseName,clustername,QUERY_FUNCTION){
        const clusterpath = path.join(databaseName,`${clustername}.json`)
        if (!fs.existsSync(clusterpath)) {
            throw new Error('cluster does not exists')
        }
        const read = JSON.parse(fs.readFileSync(clusterpath))
        const queries = read.filter(QUERY_FUNCTION)
        return queries
    }
    update(databaseName,clustername,QUERY_FUNCTION,updatedata){
        const clusterpath = path.join(databaseName,`${clustername}.json`)
        if (!fs.existsSync(clusterpath)) {
            throw new Error('cluster does not exists')
        }
        const read = JSON.parse(fs.readFileSync(clusterpath))
        read.forEach(row=>{
            if (QUERY_FUNCTION(row)) {
                Object.keys(updatedata).forEach(key=>{
                    row[key] = updatedata[key]
                })
            }
        })
        fs.writeFileSync(clusterpath,JSON.stringify(read))
    }
    delete(databaseName,clustername,QUERY_FUNCTION){
        const clusterpath = path.join(databaseName,`${clustername}.json`)
        if (!fs.existsSync(clusterpath)) {
            throw new Error('cluster does not exists')
        }
        let read = JSON.parse(fs.readFileSync(clusterpath))
        const deleteQuery = read.filter(row=>!QUERY_FUNCTION(row))
        read = deleteQuery
        fs.writeFileSync(clusterpath,JSON.stringify(read))
    }
    search(databaseName,clustername,searchElement){
        const clusterpath = path.join(databaseName,`${clustername}.json`)
        if (!fs.existsSync(clusterpath)) {
            throw new Error('cluster does not exists')
        }
        let read = JSON.parse(fs.readFileSync(clusterpath))
        const results = read.filter(obj=>{
            const values = Object.values(obj)
            for (let i = 0; i < values.length; i++) {
                if ((typeof values[i]=== "string"||typeof values[i]=== "number")&& String(values[i]).includes(searchElement)){
                    return true
                }
            }
            return false
        })
        return results
    }


}

const db = new Database()
// db.createdatabase('mydatabase')
// db.createAuthModel('mydatabase','users')
// db.signAuth('mydatabase','users',{name : 'shashank',email : 'shashank.bs@mail.com',password:'shashank'},true,false)
// const authsign =  db.Authenticate('mydatabase','users',{name : 'rehul',email : 'rehul.bs@mail.com',password:'rehul'}); console.log(authsign);
// db.updatesign('mydatabase','users',row => row.name ==='shashank',{phonenumber:988654322},true)
// console.log(db.displayAuths('mydatabase','users',()=>true));
// db.deletesign('mydatabase','users',deletes => deletes.name === 'mehul')
// console.log(db.searchAuth('mydatabase','users','a'));


// db.createcluster('mydatabase','orders')
// db.insert('mydatabase','orders',{orderno : 279,phonenumber:988654322,product:'shan'},false)
// const qery = db.Query('mydatabase','orders',(row)=> row.phonenumber === 988654321); console.log(qery);
// const qery1 = db.Query('mydatabase','orders',()=>true); console.log(qery1); // retures all data
// db.update('mydatabase','orders',row=>row.phonenumber === 988654321,{orderscoms : 891})
// db.delete('mydatabase','orders',(row)=>row.product === 'pan')
// console.log(db.search('mydatabase','orders','sl'));



