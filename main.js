let yorkie = require('yorkie-js-sdk');

const client = new yorkie.Client('localhost:8080');
client.activate().then(()=>{ 
  const unsubscribe = client.subscribe((event) => {
    if (event.type === 'status-changed') {
      console.log(event.value); // 'activated' or 'deactivated'
    } else if (event.type === 'stream-connection-status-changed') {
      console.log(event.value); // 'connected' or 'disconnected'
    }
  });
  
  const doc = new yorkie.DocumentReplica('doc-1');
  client.attach(doc).then((doc)=> {
    doc.subscribe((event) => {
      if (event.type === 'local-change') {
        console.log(event);
      } else if (event.type === 'remote-change') {
        for (const changeInfo of event.value) {
          // `message` delivered when calling document.update
          console.log(changeInfo.change.message);
          for (const path of changeInfo.paths) {
            if (path.startsWith('$.obj.num')) {
              // root.obj.num is changed
            } else if (path.startsWith('$.obj')) {
              // root.obj is changed
            }
          }
        }
      }
    });
    
    const message = 'update document for test';
    doc.update((root) => {
      root.obj = {};              // {"obj":{}}
      root.obj.num = 1;           // {"obj":{"num":1}}
      root.obj.obj = {'str':'a'}; // {"obj":{"num":1,"obj":{"str":"a"}}}
      root.obj.arr = ['1', '2'];  // {"obj":{"num":1,"obj":{"str":"a"},"arr":[1,2]}}
    }, message);
    
    const root = doc.getRoot();
    console.log(root.obj);     // {"num":1,"obj":{"str":"a"},"arr":[1,2]}
    console.log(root.obj.num); // 1
    console.log(root.obj.obj); // {"str":"a"}
    console.log(root.obj.arr); // [1,2]
  })
})

