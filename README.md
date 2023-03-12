## 安装

```bash
npm install node-mysql
```

## 连接数据库

```js
const db = new NodeMysql({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'test'
})
```

## 查询

```js
db.table('admins')
  .where({ id: 1 })
  .where("adminName='admin'")
  .orderBy({ id: 'ASC' })
  .limit(0, 1)
  .find()
  .then((res) => console.log(res))
```

## 插入

```js
db.table('user')
  .create({
    username: '尼古拉斯凯奇',
    email: 'nglskq@email.com'
  })
  .then((res) => console.log(res))
```

## 修改

```js
db.table('user')
  .where({ id: 2 })
  .update({ username: 'zs', email: '123@qq.com' })
  .then((res) => console.log(res))
```

## 删除

```js
db.table('user')
  .where('id', 3)
  .delete()
  .then((res) => console.log(res))
```
