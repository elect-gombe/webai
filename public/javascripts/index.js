//学習済みの推論モデル
var model;
//ロード済み画像
var imgs;
//類似度
var simmatrix=[];
//objectlistの取得。　
var objlist=JSON.parse(document.getElementById("picsdat").value);

//モデルのロード
mobilenet.load().then((m)=>{model=m;});


//imageのロード
// loadcですべての画像のロードをカウントし、全て溜まったら処理を開始する
var loadc = 0;
function preload ()
{
    imgs=[];
    for(let i=0;i<objlist.length;i++){
	imgs.push(new Image());
	imgs[i].src=objlist[i].link;
	imgs[i].onload=function(){
	    loadc++;
	    if(loadc==imgs.length){
		draw();
		updaterecently();
	    }
	}
    }
}

//時間の差分を文字列にする関数
function subtostr(time){
    var t = Math.floor(time/(1000*60)); // ms to min
    if(t < 1)return "1分未満";
    else if(t<60) return t+"分前"
    else{
	t = Math.floor(t/60); //min to hour
	if(t<24) return t+"時間前"
	else{
	    t = Math.floor(t/24);//hour to days
	    return t+"日前";
	}
    }
}

//cardの追加
// indexを受けとり、strを題名に描画する
function pushcardlist(i,str){
    var piclist;
    piclist = document.getElementById("similar");
    var pe;
    {
	var imgdiv;
	var img;
	imgdiv=document.createElement("div");
	imgdiv.setAttribute("class", "image");
	img=document.createElement("img");
	img.setAttribute("src", objlist[i].link);
	pe=document.createElement("div");
	pe.setAttribute("class", "card");
	imgdiv.appendChild(img);
	pe.appendChild(imgdiv);
    }
    {
	var content;
	content=document.createElement("div");
	content.setAttribute("class", "content");
	var drecently = new Date(objlist[0].date);
	var d = new Date(objlist[i].date);
	content.appendChild(document.createTextNode(str));
	pe.appendChild(content);
    }
    piclist.appendChild(pe);
}

// 最近アップロードされた画像に対して似ている画像を算出。
// しきい値を0.05にしている。
function updaterecently(){
    pushcardlist(0,"最近アップロードされた基準画像");
    for(let i=0;i<objlist.length-1;i++){
	if(simmatrix[i][0] > 0.05){
	    var drecently = new Date(objlist[0].date);
	    var d = new Date(objlist[i+1].date);
	    pushcardlist(i+1,objlist[i+1].date+" "+subtostr(drecently-d));
	}
    }
}

// 予測を実行
// classify で上位10要素だけ算出
function predict(idx){
    model.classify(imgs[idx],10).then(predictions => {
	imgs[idx].predict=predictions;
	const pindex=predictions.map(function(i){
	    //所望の名前のindex を探す。
	    var ind;
	    for (ind = 0; ind < IMAGENET_CLASSES.length; ind++) {
		if (IMAGENET_CLASSES[ind] === i.className) {
		    break;
		}  
	    }if(ind==IMAGENET_CLASSES.length){
		alert("failed");//見つからない場合
		return;
	    }
	    return {index:ind,probability:i.probability};
	});
	var feature=document.getElementById("feature");
	feature.value=String(JSON.stringify(pindex));
	
	document.getElementById("imgform").submit();
    });
}

//file セレクタ
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

	// Only process image files.
	if (!f.type.match('image.*')) {
            continue;
	}

	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function(theFile) {
	    return function(e) {
		var img = document.createElement("img");
		img.src = e.target.result;
		img.width=224;img.height=224;
		img.onload=function(){
		    imgs.push(img);
		    predict(imgs.length-1);
		}
		img.setAttribute("class", "thumb");
		var span = document.createElement('span');
		span.appendChild(img);
		document.getElementById('list').insertBefore(span, null);
            };
	})(f);

	// Read in the image file as a data URL.
	reader.readAsDataURL(f);
    }
}

// 類似度のマトリクスを生成する
function gensimmatrix(){
    var len=objlist.length;
    for(let i=1;i<len;i++){
	var t=[];
	for(let j=0;j<i;j++){
	    t.push(similarity(JSON.parse(objlist[i].feature),JSON.parse(objlist[j].feature)));
	}
	simmatrix.push(t);
    }
}

//canvasに描画する
function draw(){
    gensimmatrix();
    var canvas=document.getElementById('canvas');
    if(!canvas){
	throw new Error("canvas is not found");
    }
    var ctx=canvas.getContext('2d');
    var len=objlist.length;
    var wpp = canvas.width/(len);//canvas.width per picture
    for(let i=0;i<len-1;i++){
	ctx.drawImage(imgs[i+1],0,i*wpp,wpp,wpp);
    }
    for(let i=0;i<len-1;i++){
	ctx.drawImage(imgs[i],(i+1)*wpp,canvas.height-wpp,wpp,wpp);
    }
    for(let i=0;i<len-1;i++){
	for(let j=0;j<=i;j++){
	    var bri=simmatrix[i][j]*2000;
	    bri=bri>255?255:bri;
	    
	    ctx.fillStyle = 'rgb('+bri+','+10+','+30+')';
	    ctx.fillRect((j+1)*wpp,(i)*wpp,wpp,wpp);
	}
    }
}

//類似度の算定
//内積を取り、それを2つのベクトルの総和の和+0.1で割る
//いろいろありそうだが、実はベクトルの総和の積で割ったほうがいいのかもしれない
function similarity(obja,objb){
    var acc=0;
    const acc2= (obja.reduce((acc, i) => acc + i.probability,0)+
		 objb.reduce((acc2,j)=>acc2+j.probability,0))/2+0.1;
    obja.forEach(function(i){
	var a=objb.find(j=>j.index === i.index);
	if(a)acc += i.probability*a.probability;
    });
    
    return acc/acc2;
}

document.getElementById('imagefile').addEventListener('change', handleFileSelect, false);
preload();
