package noncetracker

import "sync"

type NonceTracker struct {
	sync.Mutex
	nonce uint64
}

func NewNonceTracker() *NonceTracker {
	return &NonceTracker{
		nonce: 0,
	}
}

func (nt *NonceTracker) GetNonce() uint64 {
	nt.Lock()
	defer nt.Unlock()
	nt.nonce++
	return nt.nonce
}
