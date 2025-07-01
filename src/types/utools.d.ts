/**
 * uTools API 类型声明文件
 * 用于提供 uTools 插件开发的类型支持
 */

// 扩展 Window 接口
declare global {
  interface Window {
    utools: UTools;
    services?: any;
  }
}

/**
 * uTools 主接口
 */
interface UTools {
  /**
   * 插件进入事件监听
   * @param callback 回调函数
   */
  onPluginEnter(callback: (action: PluginEnterAction) => void): void;
  
  /**
   * 插件退出事件监听
   * @param callback 回调函数
   */
  onPluginOut(callback: (isKill: boolean) => void): void;
  
  /**
   * 数据库操作接口
   */
  db: UToolsDB;
  
  /**
   * 显示通知
   * @param message 通知消息
   */
  showNotification?(message: string): void;
  
  /**
   * 获取系统路径
   * @param name 路径名称
   */
  getPath?(name: string): string;
}

/**
 * 插件进入动作接口
 */
interface PluginEnterAction {
  /**
   * 功能代码
   */
  code: string;
  
  /**
   * 触发类型
   */
  type: string;
  
  /**
   * 载荷数据
   */
  payload: any;
}

/**
 * uTools 数据库接口
 */
interface UToolsDB {
  /**
   * 获取文档
   * @param id 文档ID
   */
  get(id: string): UToolsDBDoc | null;
  
  /**
   * 保存文档
   * @param doc 文档对象
   */
  put(doc: UToolsDBDoc): UToolsDBResult;
  
  /**
   * 删除文档
   * @param id 文档ID
   */
  remove(id: string): UToolsDBResult;
  
  /**
   * 获取所有文档
   */
  allDocs(): UToolsDBAllDocsResult;
}

/**
 * uTools 数据库文档接口
 */
interface UToolsDBDoc {
  /**
   * 文档ID
   */
  _id: string;
  
  /**
   * 文档版本
   */
  _rev?: string;
  
  /**
   * 文档数据
   */
  data?: any;
  
  /**
   * 其他属性
   */
  [key: string]: any;
}

/**
 * uTools 数据库操作结果接口
 */
interface UToolsDBResult {
  /**
   * 操作是否成功
   */
  ok: boolean;
  
  /**
   * 文档ID
   */
  id?: string;
  
  /**
   * 文档版本
   */
  rev?: string;
}

/**
 * uTools 数据库查询所有文档结果接口
 */
interface UToolsDBAllDocsResult {
  /**
   * 文档行数组
   */
  rows: Array<{
    /**
     * 文档对象
     */
    doc: UToolsDBDoc;
  }>;
}

export {};