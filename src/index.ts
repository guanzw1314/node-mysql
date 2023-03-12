import { createConnection, Connection, ConnectionConfig } from 'mysql'

interface Params extends Record<string, string | number> {}
type Sort = 'asc' | 'desc' | 'ASC' | 'DESC'
interface OrderByParams extends Record<string, Sort> {}

export class NodeMysql {
  private db: Connection
  private _table = ''
  private _column = '*'
  private _where = ''
  private _orderBy = ''
  private _limit = ''

  constructor(connectionUri: string | ConnectionConfig) {
    this.db = createConnection(connectionUri)
  }

  /**
   * 重置参数
   */
  private _reset() {
    this._table = ''
    this._column = '*'
    this._where = ''
    this._orderBy = ''
    this._limit = ''
  }

  /**
   * 是否需要转 JSON
   * @param any 检查目标
   */
  private isToJSON(any: any) {
    return /\./.test(any) ? any : JSON.stringify(any)
  }

  /**
   * 数据表
   * @param name 表名
   * @example
   * table('user')
   * table('user,order,...')
   * table('user', 'order', ...)
   */
  table(...names: string[]) {
    this._table = names.join(',')

    return this
  }

  /**
   * 自定表字段
   * @param field 字段
   * @example
   * column('username')
   * column('id,username,...')
   * column('id', 'username', ...)
   */
  column(...field: string[]) {
    this._column = field.join(',')

    return this
  }

  /**
   * 条件
   * @param params 条件参数
   * @param args [运算符|条件的值]
   * @example
   * id = 1
   * where('id = 1')
   * where('id', 1)
   * where({ id: 1, username: '', ... })
   * id > 1
   * where('id > 1')
   * where('id', '>', 1)
   */
  where(params: Params | string, ...args: Array<string | number>) {
    let paramsStr = ''

    if (typeof params === 'string') {
      if (args.length === 0) paramsStr = params
      if (args.length === 1) paramsStr = `${params} = ${this.isToJSON(args[0])}`
      if (args.length === 2)
        paramsStr = `${params} ${args[0]} ${this.isToJSON(args[1])}`
    } else {
      const paramsArr: string[] = []
      for (const k in params) {
        paramsArr.push(`${k} = ${this.isToJSON(params[k])}`)
      }
      paramsStr = paramsArr.join(' and ')
    }
    this._where += this._where ? ' and ' + paramsStr : paramsStr

    return this
  }

  /**
   * 或条件
   * @param params 条件参数
   * @param args [运算符|条件的值]
   * @example
   * id = 1
   * where('id = 1')
   * where('id', 1)
   * where({ id: 1, username: '', ... })
   * id > 1
   * where('id > 1')
   * where('id', '>', 1)
   */
  orWhere(params: Params | string, ...args: Array<string | number>) {
    let paramsStr = ''

    if (typeof params === 'string') {
      if (args.length === 0) paramsStr = params
      if (args.length === 1) paramsStr = `${params} = ${this.isToJSON(args[0])}`
      if (args.length === 2)
        paramsStr = `${params} ${args[0]} ${this.isToJSON(args[1])}`
    } else {
      const paramsArr: string[] = []
      for (const k in params) {
        paramsArr.push(`${k} = ${this.isToJSON(params[k])}`)
      }
      paramsStr = paramsArr.join(' or ')
    }
    this._where += this._where ? ' or ' + paramsStr : paramsStr

    return this
  }

  /**
   * 排序
   * @param params 排序参数
   * @param sort 排序
   * @example
   * id asc
   * orderBy('id asc')
   * orderBy('id', 'asc')
   * orderBy({ id: 'asc', uid: 'desc', ... })
   */
  orderBy(params: OrderByParams | string, sort?: Sort) {
    let paramsStr = ''
    if (typeof params === 'string' && sort) {
      paramsStr = `${params} ${sort}`
    } else if (typeof params === 'string') {
      paramsStr = params
    } else {
      const paramsArr: string[] = []
      for (const k in params) {
        paramsArr.push(`${k} ${params[k]}`)
      }
      paramsStr = paramsArr.join(',')
    }
    this._orderBy += this._orderBy ? ',' + paramsStr : paramsStr

    return this
  }

  /**
   * 限制范围
   * @param index 开始索引
   * @param size 数据条数
   */
  limit(index: number, size: number) {
    this._limit = `${index},${size}`

    return this
  }

  /**
   * 执行 SQL
   * @param sql 执行语句
   * @param params 参数配置
   */
  query(sql: string, ...params: Array<Params | string | number>) {
    return new Promise((resolve, reject) => {
      this.db.query(sql, [...params], (err, res) => {
        if (err) return reject(err)
        resolve(res)
      })
    })
  }

  /**
   * 查询
   */
  find() {
    const { _table, _column, _where, _orderBy, _limit } = this

    let sql = `select ${_column} from ${_table}`
    if (_where) sql += ` where ${_where}`
    if (_orderBy) sql += ` order by ${_orderBy}`
    if (_limit) sql += ` limit ${_limit}`
    this._reset()

    return this.query(sql)
  }

  /**
   * 创建
   * @param params 创建参数
   */
  create(params: Params) {
    const { _table } = this

    let sql = `insert into ${_table} set ?`
    this._reset()

    return this.query(sql, params)
  }

  /**
   * 修改
   * @param params 修改参数
   */
  update(params: Params) {
    const { _table, _where } = this

    let sql = `update ${_table} set ?`
    if (_where) sql += ` where ${_where}`
    this._reset()

    return this.query(sql, params)
  }

  /**
   * 删除
   */
  delete() {
    const { _table, _where } = this

    let sql = `delete from ${_table}`
    if (_where) sql += ` where ${_where}`
    this._reset()

    return this.query(sql)
  }
}
