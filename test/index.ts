import { NodeMysql } from '../src'

const db = new NodeMysql({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'test'
})

db.table('admins')
  .where({ id: 1 })
  .where("adminName='admin'")
  .orderBy({ id: 'ASC' })
  .limit(0, 1)
  .find()
  .then((res) => console.log(res))

db.table('user').create({
  username: '尼古拉斯凯奇',
  email: 'nglskq@email.com'
})

db.table('users', 'riders')
  .column('users.mobileNumber', 'riders.riderNo')
  .where('riders.userNo', 'users.userNo')
  .find()
  .then((res) => console.log(res))

db.table('order')
  .find()
  .then((res) => console.log(res))

db.table('user')
  .where({ id: 2 })
  .update({ username: 'zs', email: '123@qq.com' })
  .then((res) => console.log(res))

db.table('user').where('id', 3).delete()
