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
   * @name 数据表
   * @description 字符串形式
   * @param name 字段字符串
   * @example
   * table('user')
   * table('user,order,...')
   */
  table(name: string): this
  /**
   * @name 数据表
   * @description 参数形式
   * @param name 字段数组
   * @example
   * table('user', 'order', ...)
   */
  table(...name: string[]): this
  table(...names: string[]) {
    this._table = names.join(',')

    return this
  }

  /**
   * @name 字段
   * @description 字符串形式
   * @param field 字段字符串
   * @example
   * column('username')
   * column('id,username,...')
   */
  column(field: string): this
  /**
   * @name 字段
   * @description 参数形式
   * @param field 字段数组
   * @example
   * column('id', 'username', ...)
   */
  column(...field: string[]): this
  column(...field: string[]) {
    this._column = field.join(',')

    return this
  }

  /**
   * @name 条件
   * @description 字符串形式
   * @param params 条件参数字符串
   * @example
   * where('id = 1 and id < 3 ...')
   */
  where(params: string): this
  /**
   * @name 条件
   * @description 键值对形式
   * @param key 键
   * @param value 值
   * @example
   * where('id', 1)
   */
  where(key: string, value: string | number): this
  /**
   * @name 条件
   * @description 自定义运算符
   * @param key 键
   * @param oper 运算符
   * @param value 值
   * @example
   * where('id', '>', 1)
   */
  where(key: string, oper: string, value: string | number): this
  /**
   * @name 条件
   * @description 对象参数形式
   * @param params 条件参数对象
   * @example
   * where({ id: 1, username: '', ... })
   */
  where(params: Params): this
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
   * @name 或条件
   * @description 字符串形式
   * @param params 条件参数字符串
   * @example
   * orWhere('id = 1 and id < 3 ...')
   */
  orWhere(params: string): this
  /**
   * @name 或条件
   * @description 键值对形式
   * @param key 键
   * @param value 值
   * @example
   * orWhere('id', 1)
   */
  orWhere(key: string, value: string | number): this
  /**
   * @name 或条件
   * @description 自定义运算符
   * @param key 键
   * @param oper 运算符
   * @param value 值
   * @example
   * orWhere('id', '>', 1)
   */
  orWhere(key: string, oper: string, value: string | number): this
  /**
   * @name 或条件
   * @description 对象参数形式
   * @param params 条件参数对象
   * @example
   * orWhere({ id: 1, username: '', ... })
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
   * @name 排序
   * @description 字符串形式
   * @param params 排序参数字符串
   * @example
   * orderBy('id asc, uid desc, ...')
   */
  orderBy(params: string): this
  /**
   * @name 排序
   * @description 键值对形式
   * @param params 排序参数对象
   * @example
   * orderBy('id', 'asc')
   */
  orderBy(kay: string, sort: Sort): this
  /**
   * @name 排序
   * @description 对象参数形式
   * @param params 排序参数对象
   * @example
   * orderBy({ id: 'asc', uid: 'desc', ... })
   */
  orderBy(params: OrderByParams): this
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
   * @name 分页
   * @param index 开始索引
   * @param size 数据条数
   */
  limit(index: number, size: number) {
    this._limit = `${index},${size}`

    return this
  }

  /**
   * @name 执行SQL
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
   * @name 查询
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
   * @name 创建
   * @param params 创建参数
   */
  create(params: Params) {
    const { _table } = this

    let sql = `insert into ${_table} set ?`
    this._reset()

    return this.query(sql, params)
  }

  /**
   * @name 修改
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
   * @name 删除
   */
  delete() {
    const { _table, _where } = this

    let sql = `delete from ${_table}`
    if (_where) sql += ` where ${_where}`
    this._reset()

    return this.query(sql)
  }
}
