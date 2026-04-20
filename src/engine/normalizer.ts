import { assertValidSource } from './validator';

// Đã bổ sung List, Map, ArrayList, HashMap vào pattern
const declarationPattern =
  /^(\s*)(?:final\s+)?(?:int|double|float|long|boolean|String|var|List|Map|Set|ArrayList|HashMap)(?:\s*\[\])?\s+([A-Za-z_]\w*)(\s*=\s*.*;\s*)$/u;

const methodPattern =
  /^\s*(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|double|float|long|boolean|String|var|List|Map|Set|ArrayList|HashMap)(?:\s*\[\])?\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/u;

export function normalizeJavaLikeSource(source: string): string {
  assertValidSource(source);

  let detectedMethodName = '';

  // POLYFILL: Dạy cho JavaScript hiểu cấu trúc của Java
  // Sử dụng cú pháp ES5 thuần (không dùng class, không dùng prototype = [])
  // vì js-interpreter chỉ hỗ trợ ES5
  const needsCollections = /\b(ArrayList|HashMap)\b/.test(source);
  const polyfill = needsCollections ? `
    function ArrayList() { this._d = []; }
    ArrayList.prototype.add = function(e) { this._d.push(e); return true; };
    ArrayList.prototype.get = function(i) { return this._d[i]; };
    ArrayList.prototype.set = function(i, e) { var old = this._d[i]; this._d[i] = e; return old; };
    ArrayList.prototype.remove = function(i) { return this._d.splice(i, 1)[0]; };
    ArrayList.prototype.size = function() { return this._d.length; };
    ArrayList.prototype.isEmpty = function() { return this._d.length === 0; };

    function HashMap() { this._k = []; this._v = []; }
    HashMap.prototype._i = function(k) { var i; for (i = 0; i < this._k.length; i++) { if (this._k[i] == k) { return i; } } return -1; };
    HashMap.prototype.put = function(k, v) { var i = this._i(k); if (i >= 0) { this._v[i] = v; } else { this._k.push(k); this._v.push(v); } return null; };
    HashMap.prototype.get = function(k) { var i = this._i(k); if (i >= 0) { return this._v[i]; } return null; };
    HashMap.prototype.containsKey = function(k) { return this._i(k) >= 0; };
    HashMap.prototype.getOrDefault = function(k, d) { var i = this._i(k); if (i >= 0) { return this._v[i]; } return d; };
    HashMap.prototype.keySet = function() { return this._k.slice(0); };
    HashMap.prototype.size = function() { return this._k.length; };
    HashMap.prototype.isEmpty = function() { return this._k.length === 0; };
  ` : ``;

  const normalizedLines = source.split(/\r?\n/u).map((rawLine) => {
    let line = rawLine;

    // Bỏ qua các dòng import
    if (/^\s*import\s+/.test(line)) return '';

    // Xóa Generics: List<Integer> -> List, new ArrayList<>() -> new ArrayList()
    line = line.replace(/\b(List|ArrayList|Map|HashMap|Set|HashSet)\s*<[^>]*>/g, '$1');
    // 🔥 FIX new ArrayList<>()
    line = line.replace(/new\s+ArrayList\s*\(\s*\)/g, 'new ArrayList()');
    // 🔥 FIX .equals (đặt sớm để chắc chắn ăn)
    line = line.replace(/([a-zA-Z_]\w*)\.equals\(([^)]+)\)/g, '$1 === $2');
    // 1. Hàm Java
    const methodMatch = line.match(methodPattern);
    if (methodMatch) {
      detectedMethodName = methodMatch[1] || '';
      let params = methodMatch[2] || '';
      params = params.replace(/(?:final\s+)?(?:int|double|float|long|boolean|String|var|List|Map|Set|ArrayList|HashMap)(?:\s*\[\])?\s+([A-Za-z_]\w*)/gu, '$1');
      return `function ${detectedMethodName}(${params}) {`;
    }

    // 2. Khai báo biến
    const declarationMatch = line.match(declarationPattern);
    if (declarationMatch) {
      const indent = declarationMatch[1] || '';
      const variableName = declarationMatch[2] || '';
      const assignment = declarationMatch[3] || '';
      const fixedAssignment = (assignment || '').replace(/\(([^)]+)\)\s*\/\s*2/g, 'Math.floor(($1) / 2)');
      return `${indent}${variableName}${fixedAssignment}`;
    }

    // 3. Xử lý chia nguyên, in ấn, for
    return line
      .replace(/\(([^)]+)\)\s*\/\s*2/g, 'Math.floor(($1) / 2)')
      .replace(/System\.out\.println\s*\(/gu, 'print(')
      .replace(
        /for\s*\(\s*(?:final\s+)?(?:int|double|float|long|boolean|String|var)\s+([A-Za-z_]\w*)\s*=/gu,
        'for ($1 ='
      )
      .replace(/([a-zA-Z_]\w*)\.equals\(([^)]+)\)/g, '$1 === $2');
  });

  let finalSource = polyfill + '\n' + normalizedLines.join('\n');

  if (detectedMethodName) {
    finalSource += `\n${detectedMethodName}(typeof numbers !== 'undefined' ? numbers : [], typeof target !== 'undefined' ? target : 0);`;
  }

  return finalSource;
}